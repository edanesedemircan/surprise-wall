using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AniDefteri.Api.Data;
using AniDefteri.Api.Models;

namespace AniDefteri.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MemoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MemoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddMemory([FromBody] AddMemoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.AuthorName) || string.IsNullOrWhiteSpace(dto.Content))
            {
                return BadRequest(new { Message = "İsim ve anı içeriği boş bırakılamaz!" });
            }

            var wallExists = await _context.Walls.AnyAsync(w => w.Id == dto.WallId);
            if (!wallExists)
            {
                return NotFound(new { Message = "Anı eklenmek istenen duvar bulunamadı!" });
            }

            var newMemory = new Memory
            {
                WallId = dto.WallId,
                AuthorName = dto.AuthorName,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Memories.Add(newMemory);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Anınız duvara asıldı! 📝✨", MemoryId = newMemory.Id });
        }

       [HttpGet("wall/{wallId}")]
        public async Task<IActionResult> GetWallMemories(int wallId, [FromQuery] string? userEmail)
        {
            // 1. Önce bu anıların ait olduğu Duvar (Oda) bilgilerini çekiyoruz
            var wall = await _context.Walls.FirstOrDefaultAsync(w => w.Id == wallId);
            if (wall == null)
            {
                return NotFound(new { Message = "Duvar bulunamadı!" });
            }

            // 2. KRİTİK KONTROL (Başrol Kilidi): 
            // Eğer odaya giren kişinin maili Arife'nin maili ile eşleşiyorsa VE hedef tarih henüz gelmediyse anıları gizle!
            if (!string.IsNullOrWhiteSpace(userEmail) && 
                userEmail.Equals(wall.TargetEmail, StringComparison.OrdinalIgnoreCase) && 
                DateTime.UtcNow < wall.TargetDate)
            {
                // İçeride anı varmış gibi hissettirmemek için başrol'e boş liste fırlatıyoruz 
                return Ok(new List<object>());
            }

            // 3. Eğer giren kişi davetliyse VEYA süre bittiyse tüm anıları listele
            var memories = await _context.Memories
                .Where(m => m.WallId == wallId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new {
                    m.Id,
                    m.AuthorName,
                    m.Content,
                    m.CreatedAt
                })
                .ToListAsync();

            return Ok(memories);
        }
    }
}