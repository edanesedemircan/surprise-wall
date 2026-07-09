using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AniDefteri.Api.Data;
using AniDefteri.Api.Models;

namespace AniDefteri.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WallController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WallController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
public async Task<IActionResult> CreateWall([FromBody] CreateWallDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.TargetEmail))
    {
        return BadRequest(new { Message = "Başlık ve Hedef E-posta alanları zorunludur!" });
    }

    // DTO'dan gelen verileri gerçek veritabanı modelimize (Wall) eşliyoruz
    var newWall = new Wall
    {
        Title = dto.Title,
        Theme = dto.Theme,
        TargetEmail = dto.TargetEmail,
        AllowedEmails = dto.AllowedEmails,
        
        // İşte aramıza yeni katılan admin/sahip e-posta eşlemesi:
        CreatorEmail = dto.CreatorEmail, 

        IsCountdownActive = dto.IsCountdownActive,
        TargetDate = dto.TargetDate?.ToUniversalTime(), 
        CreatedAt = DateTime.UtcNow
    };

    // Veritabanına ekleme operasyonu
    _context.Walls.Add(newWall);
    await _context.SaveChangesAsync();

    // Başarıyla oluşturuldu uyarısıyla birlikte oluşan odayı geri dönüyoruz
    return Ok(new { 
        Message = "Zaman kapsülü başarıyla oluşturuldu! 🚀", 
        WallId = newWall.Id, 
        Title = newWall.Title 
    });
}

        [HttpGet("{wallId}/check-auth")]
        public async Task<IActionResult> CheckAuth(int wallId, [FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { Message = "E-posta adresi boş olamaz!" });
            }

            // Veritabanından odayı buluyoruz
            var wall = await _context.Walls.FirstOrDefaultAsync(w => w.Id == wallId);
            if (wall == null)
            {
                return NotFound(new { Message = "Böyle bir oda bulunamadı!" });
            }

            string cleanEmail = email.Trim().ToLower();

            // 1. SENARYO: Giriş yapan kişi Başrol (Arife) ise
            if (cleanEmail.Equals(wall.TargetEmail.Trim().ToLower()))
            {
                return Ok(new { 
                    Role = "Admin", 
                    Title = "Senin İçin Bir Sürpriz Var! ✨", 
                    WallId = wall.Id 
                });
            }

            // 2. SENARYO: Giriş yapan kişi Davetli Listesindeyse
            if (wall.AllowedEmails != null && wall.AllowedEmails.Any(e => e.Trim().ToLower() == cleanEmail))
            {
                return Ok(new { 
                    Role = "User", 
                    Title = wall.Title, 
                    WallId = wall.Id 
                });
            }

            // 3. SENARYO: Oda Sahibi / Yönetici Girişi 
            if (cleanEmail.Equals("eda@gmail.com")) 
            {
                return Ok(new { 
                    Role = "Creator", 
                    Title = $"{wall.Title} (Yönetim Paneli)", 
                    WallId = wall.Id 
                });
            }

            // 4. SENARYO: Tamamen yabancı, davetsiz biri sızmaya çalışıyorsa
            return Unauthorized(new { Message = "Bu gizli odaya erişim izniniz bulunmuyor!" });
        }
    }
}