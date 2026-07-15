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

        // 1. ANILARI SİLME
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

        // 2. ANILARI DÜZENLEME
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

        // 3. KAPSÜLÜ İMHA ETME (Quizzes çakışması giderilmiş temiz sürüm!)
        [HttpDelete("/api/memory/wall/{id}")]
        public async Task<IActionResult> DeleteWall(int id)
        {
            var wall = await _context.Walls.FindAsync(id);
            if (wall == null)
            {
                return NotFound(new { message = "Oda bulunamadı!" });
            }

            try
            {
                // 1. Önce bu odaya (WallId) bağlı tüm anıları siliyoruz
                var memories = _context.Memories.Where(m => m.WallId == id);
                _context.Memories.RemoveRange(memories);

                // 2. Ardından odanın kendisini siliyoruz (Quizzes kısmı çıkarıldı kanka!)
                _context.Walls.Remove(wall);

                await _context.SaveChangesAsync();
                return Ok(new { message = "Zaman kapsülü ve içindeki tüm veriler başarıyla imha edildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "İmha işlemi sırasında bir hata oluştu.", error = ex.Message });
            }
        }

    // 4. DAVETLİ EKLEME (Senin AllowedEmails listenle entegre ettik kanka!)
        [HttpPost("/api/memory/wall/{id}/co-creator")] 
        public async Task<IActionResult> AddCoCreator(int id, [FromBody] CoCreatorRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "E-posta adresi boş olamaz!" });
            }

            // 1. Böyle bir oda (Wall) var mı?
            var wall = await _context.Walls.FirstOrDefaultAsync(w => w.Id == id);
            if (wall == null)
            {
                return NotFound(new { message = "Oda bulunamadı!" });
            }

            var emailToAdd = request.Email.Trim().ToLower();

            // Bu mail adresi zaten listeye eklenmiş mi?
            if (wall.AllowedEmails.Contains(emailToAdd))
            {
                return BadRequest(new { message = "Bu e-posta adresi zaten davetliler listesinde ekli!" });
            }

            try
            {
                
                wall.AllowedEmails.Add(emailToAdd);
                
                _context.Entry(wall).State = EntityState.Modified;
                
                await _context.SaveChangesAsync();

                return Ok(new { message = "Davetli başarıyla kapsüle eklendi! ✨" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Davetli eklenirken bir hata oluştu.", error = ex.Message });
            }
        }
    }

    // İsteği karşılayan minik sınıf
    public class CoCreatorRequest
    {
        public string Email { get; set; }
    }
}