using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Google.Apis.Auth;
using AniDefteri.Api.Data;
using AniDefteri.Api.Models;

namespace AniDefteri.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] LoginDto loginDto)
        {
            try
            {
                // 1. appsettings.json içindeki Google Client ID'yi çekiyoruz
                var clientId = _configuration["Authentication:Google:ClientId"];

                // 2. Google kütüphanesi yardımıyla gelen token'ı kriptografik olarak doğruluyoruz
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(loginDto.IdToken, settings);
                
                // 3. Jeton geçerliyse, içinden kullanıcının e-postasını alıyoruz
                string userEmail = payload.Email;

                // 4. Veritabanından giriş yapılmak istenen odayı/duvarı buluyoruz
                var wall = await _context.Walls.FirstOrDefaultAsync(w => w.Id == loginDto.WallId);
                if (wall == null)
                {
                    return NotFound(new { Message = "Böyle bir anı duvarı bulunamadı!" });
                }

                // 5. ROL VE GÜVENLİ ÇEMBER KONTROLLERİ
                
                // Senaryo A: Giriş yapan kişi odanın sahibi mi? (Yönetici)
                if (wall.TargetEmail.ToLower() == userEmail.ToLower())
                {
                    return Ok(new { Role = "Admin", Email = userEmail, Title = wall.Title });
                }

                // Senaryo B: Giriş yapan kişi izin verilen listede var mı? (Davetli)
                if (wall.AllowedEmails.Any(e => e.ToLower() == userEmail.ToLower()))
                {
                    return Ok(new { Role = "Guest", Email = userEmail, Title = wall.Title });
                }

                // Senaryo C: Liste dışı biri sızmaya çalışıyor! (Kapı dışarı)
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Bu güvenli çembere dahil değilsiniz!" });
            }
            catch (InvalidJwtException)
            {
                return BadRequest(new { Message = "Geçersiz Google Jetonu!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Sistemsel bir hata oluştu.", Detail = ex.Message });
            }
        }
    }
}