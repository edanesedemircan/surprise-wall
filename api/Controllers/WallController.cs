using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AniDefteri.Api.Data;
using AniDefteri.Api.Models;
using System;
using System.Linq;
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

            // 4. SENARYO: Tamamen yabancı biri sızmaya çalışıyorsa
            return Unauthorized(new { Message = "Bu gizli odaya erişim izniniz bulunmuyor!" });
        }

        // 🚀 FRONTEND'DEKİ SAYAÇ VE TEMA İÇİN ODA DETAYLARINI DÖNEN YENİ ENDPOINT:
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
                // Tarih JS tarafında doğru pars edilsin diye ISO formatında string'e çeviriyoruz
                TargetDate = wall.TargetDate?.ToString("yyyy-MM-ddTHH:mm:ssZ")
            });
        }

        // 🚪 GÜVENLİ GEÇİŞ KAPISI: Tek İstekle Oda Kodu ve Rol Kontrolü
        [HttpPost("join")]
        public async Task<IActionResult> JoinRoom([FromBody] JoinRoomRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.RoomCode))
            {
                return BadRequest(new { success = false, message = "Lütfen geçerli bir oda kodu gir kanka." });
            }

            if (!int.TryParse(request.RoomCode, out int wallId))
            {
                return BadRequest(new { success = false, message = "Oda kodu sayısal bir değer olmalıdır." });
            }

            // Veritabanından odayı ID'sine göre buluyoruz
            var wall = await _context.Walls.FirstOrDefaultAsync(w => w.Id == wallId);

            if (wall == null)
            {
                return NotFound(new { success = false, message = "Böyle bir zaman kapsülü bulunamadı!" });
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { success = false, message = "E-posta adresi doğrulanmalıdır." });
            }

            string cleanEmail = request.Email.Trim().ToLower();

            // Rol Rol Analiz Ediyoruz:
            bool isTarget = cleanEmail.Equals(wall.TargetEmail?.Trim().ToLower());
            bool isCreator = cleanEmail.Equals(wall.CreatorEmail?.Trim().ToLower()) || cleanEmail.Equals("eda@gmail.com");
            
            // Eğer davetli listesi varsa ve giriş yapan kişi davetli listesindeyse
            bool isAllowed = wall.AllowedEmails != null && wall.AllowedEmails.Any(e => e.Trim().ToLower() == cleanEmail);

            // Başrol (Arife) veya Oda Sahibi (Sen) yetkili sayılır (isOwner)
            bool isOwner = isTarget || isCreator;

            // Eğer giren kişi ne başrol, ne kurucu, ne de izin verilenler listesindeyse kapıyı kapatıyoruz
            if (!isOwner && !isAllowed)
            {
                return Unauthorized(new { success = false, message = "Bu gizli kapsüle erişim izniniz bulunmuyor!" });
            }

            return Ok(new 
            { 
                success = true, 
                isOwner = isOwner, // true ise Sayaç/Kutlama ekranına, false ise doğrudan Anı Duvarına gidecek
                role = isTarget ? "Admin" : (isCreator ? "Creator" : "User"),
                themeName = wall.Theme,
                title = wall.Title,
                message = isOwner ? "Kapılar senin için açılıyor!" : "Giriş başarılı, anı duvarına yönlendiriliyorsunuz."
            });
        }
    }

    // İstek Model Yapısı (DTO)
    public class JoinRoomRequest
    {
        public string RoomCode { get; set; }
        public string Email { get; set; }
    }
}