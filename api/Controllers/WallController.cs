using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AniDefteri.Api.Data;
using AniDefteri.Api.Models;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

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

            var newWall = new Wall
            {
                Title = dto.Title,
                Theme = dto.Theme,
                TargetEmail = dto.TargetEmail,
                AllowedEmails = dto.AllowedEmails,
                CreatorEmail = dto.CreatorEmail, 
                IsCountdownActive = dto.IsCountdownActive,
                TargetDate = dto.TargetDate?.ToUniversalTime(), 
                CreatedAt = DateTime.UtcNow
            };

            _context.Walls.Add(newWall);
            await _context.SaveChangesAsync();

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

            var wall = await _context.Walls.FirstOrDefaultAsync(w => w.Id == wallId);
            if (wall == null)
            {
                return NotFound(new { Message = "Böyle bir oda bulunamadı!" });
            }

            string cleanEmail = email.Trim().ToLower();

            if (cleanEmail.Equals(wall.TargetEmail.Trim().ToLower()))
            {
                return Ok(new { 
                    Role = "Admin", 
                    Title = "Senin İçin Bir Sürpriz Var! ✨", 
                    WallId = wall.Id 
                });
            }

            if (wall.AllowedEmails != null && wall.AllowedEmails.Any(e => e.Trim().ToLower() == cleanEmail))
            {
                return Ok(new { 
                    Role = "Guest", 
                    Title = wall.Title, 
                    WallId = wall.Id 
                });
            }

            if (cleanEmail.Equals("eda@gmail.com")) 
            {
                return Ok(new { 
                    Role = "Creator", 
                    Title = $"{wall.Title} (Yönetim Paneli)", 
                    WallId = wall.Id 
                });
            }

            return Unauthorized(new { Message = "Bu gizli odaya erişim izniniz bulunmuyor!" });
        }

        [HttpGet("{wallId}")]
        public async Task<IActionResult> GetWallById(int wallId)
        {
            var wall = await _context.Walls.FirstOrDefaultAsync(w => w.Id == wallId);
            
            if (wall == null)
            {
                return NotFound(new { Message = "Böyle bir anı duvarı bulunamadı!" });
            }

            return Ok(new
            {
                Id = wall.Id,
                Title = wall.Title,
                Theme = wall.Theme,
                TargetEmail = wall.TargetEmail,
                IsCountdownActive = wall.IsCountdownActive,
                TargetDate = wall.TargetDate?.ToString("yyyy-MM-ddTHH:mm:ssZ")
            });
        }
        
        [HttpPost("join")]
        public async Task<IActionResult> JoinRoom([FromBody] JoinRoomRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.RoomCode))
            {
                return BadRequest(new { success = false, message = "Lütfen geçerli bir oda kodu gir." });
            }

            if (!int.TryParse(request.RoomCode, out int wallId))
            {
                return BadRequest(new { success = false, message = "Oda kodu sayısal olmalıdır." });
            }s

            var wall = await _context.Walls.FirstOrDefaultAsync(w => w.Id == wallId);
            if (wall == null)
            {
                return NotFound(new { success = false, message = "Böyle bir zaman kapsülü bulunamadı!" });
            }

            string cleanEmail = request.Email?.Trim().ToLower() ?? "";

            bool isTarget = cleanEmail.Equals(wall.TargetEmail?.Trim().ToLower());
            bool isCreator = cleanEmail.Equals(wall.CreatorEmail?.Trim().ToLower()) || cleanEmail.Equals("eda@gmail.com");
            bool isAllowed = wall.AllowedEmails != null && wall.AllowedEmails.Any(e => e.Trim().ToLower() == cleanEmail);

            bool isOwner = isTarget || isCreator;

            if (!isOwner && !isAllowed)
            {
                return Unauthorized(new { success = false, message = "Bu gizli kapsüle erişim izniniz bulunmuyor!" });
            }

            return Ok(new 
            { 
                success = true, 
                isOwner = isOwner,
                // Davetlileri sisteme "Guest" rolüyle bildiriyoruz
                role = isTarget ? "Admin" : (isCreator ? "Creator" : "Guest"),
                themeName = wall.Theme,
                title = wall.Title
            });
        }

    [HttpDelete("{id}")]
public async Task<IActionResult> DeleteWall(int id)
{
    var wall = await _context.Walls.FindAsync(id);
    if (wall == null)
    {
        return NotFound(new { message = "Oda bulunamadı!" });
    }

    try
    {
        var memories = _context.Memories.Where(m => m.WallId == id);
        _context.Memories.RemoveRange(memories);

        var quizzes = _context.Quizzes.Where(q => q.WallId == id);
        _context.Quizzes.RemoveRange(quizzes);

        _context.Walls.Remove(wall);

        await _context.SaveChangesAsync();
        return Ok(new { message = "Zaman kapsülü ve içindeki tüm veriler başarıyla imha edildi." });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "İmha işlemi sırasında bir hata oluştu.", error = ex.Message });
    }
}

    [HttpPost("{id}/co-creator")] 
public async Task<IActionResult> AddCoCreator(int id, [FromBody] CoCreatorRequest request)
{
    if (string.IsNullOrEmpty(request.Email))
    {
        return BadRequest(new { message = "E-posta adresi boş olamaz!" });
    }

    // 1. Böyle bir oda var mı?
    var wall = await _context.Walls.FindAsync(id);
    if (wall == null)
    {
        return NotFound(new { message = "Oda bulunamadı!" });
    }

    // 2. Bu mail adresi bu oda için daha önce eklenmiş mi?
    var alreadyExists = await _context.WallCoCreators.AnyAsync(wcc => 
        wcc.WallId == id && 
        wcc.Email.ToLower() == request.Email.Trim().ToLower());

    if (alreadyExists)
    {
        return BadRequest(new { message = "Bu e-posta adresi zaten bu odada yetkili!" });
    }

    try
    {
       
        var newCoCreator = new WallCoCreator
        {
            WallId = id,
            Email = request.Email.Trim().ToLower()
        };

        _context.WallCoCreators.Add(newCoCreator);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Yeni yetkili başarıyla kapsüle eklendi." });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Yetkili eklenirken bir hata oluştu.", error = ex.Message });
    }
}


    }

    public class JoinRoomRequest
    {
        public string RoomCode { get; set; }
        public string Email { get; set; }
    }
}