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
                ImageUrl = dto.ImageUrl, 
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
            if (!string.IsNullOrWhiteSpace(userEmail) && 
                userEmail.Equals(wall.TargetEmail, StringComparison.OrdinalIgnoreCase) && 
                DateTime.UtcNow < wall.TargetDate)
            {
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
                    m.ImageUrl, 
                    m.CreatedAt
                })
                .ToListAsync();

            return Ok(memories);
        }

        //  1. ANILARI SİLME
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteMemory(int id)
{
    var memory = await _context.Memories.FindAsync(id);
    if (memory == null)
    {
        return NotFound(new { Message = "Silinmek istenen anı bulunamadı!" });
    }

    _context.Memories.Remove(memory);
    await _context.SaveChangesAsync();

    return Ok(new { Message = "Anı başarıyla silindi! 🗑️" });
}

//  2. ANILARI DÜZENLEME
[HttpPut("{id}")]
public async Task<IActionResult> UpdateMemory(int id, [FromBody] AddMemoryDto dto)
{
    var memory = await _context.Memories.FindAsync(id);
    if (memory == null)
    {
        return NotFound(new { Message = "Düzenlenmek istenen anı bulunamadı!" });
    }

    if (string.IsNullOrWhiteSpace(dto.AuthorName) || string.IsNullOrWhiteSpace(dto.Content))
    {
        return BadRequest(new { Message = "İsim ve içerik alanları boş bırakılamaz!" });
    }

    // Bilgileri güncelliyoruz
    memory.AuthorName = dto.AuthorName;
    memory.Content = dto.Content;
    
    if (dto.ImageUrl != null)
    {
        memory.ImageUrl = dto.ImageUrl;
    }

    await _context.SaveChangesAsync();
    return Ok(new { Message = "Anı başarıyla güncellendi! 📝" });
}
    }
}