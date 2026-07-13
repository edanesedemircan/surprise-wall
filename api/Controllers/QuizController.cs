using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AniDefteri.Api.Controllers; 
using AniDefteri.Api.Models;

namespace AniDefteri.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class QuizController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizController(AppDbContext context)
        {
            _context = context;
        }

        // YENİ SORU EKLEME
        [HttpPost("add")]
        public async Task<IActionResult> AddQuestion([FromBody] QuizQuestion question)
        {
            if (string.IsNullOrWhiteSpace(question.QuestionText))
            {
                return BadRequest(new { Message = "Soru alanı boş bırakılamaz!" });
            }

            _context.QuizQuestions.Add(question);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Soru başarıyla kapsüle gizlendi! 🧠💥" });
        }

        // ODANIN TÜM SORULARINI GETİRME 
        [HttpGet("wall/{wallId}")]
        public async Task<IActionResult> GetWallQuestions(int wallId)
        {
            var questions = await _context.QuizQuestions
                .Where(q => q.WallId == wallId)
                .OrderBy(q => q.CreatedAt)
                .ToListAsync();

            return Ok(questions);
        }

        //  SORU SİLME 
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.QuizQuestions.FindAsync(id);
            if (question == null) 
            {
                return NotFound(new { Message = "Silinmek istenen soru zaten yok!" });
            }

            _context.QuizQuestions.Remove(question);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Soru başarıyla imha edildi! 💣" });
        }

        // SORU DÜZENLEME 
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuizQuestion dto)
        {
            var question = await _context.QuizQuestions.FindAsync(id);
            if (question == null) 
            {
                return NotFound(new { Message = "Güncellenmek istenen soru bulunamadı!" });
            }

            // Verileri güncelliyoruz 
            question.QuestionText = dto.QuestionText;
            question.OptionA = dto.OptionA;
            question.OptionB = dto.OptionB;
            question.OptionC = dto.OptionC;
            question.OptionD = dto.OptionD;
            question.CorrectOption = dto.CorrectOption;
            question.CreatorName = dto.CreatorName;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Soru başarıyla güncellendi! 📝" });
        }
    }
}