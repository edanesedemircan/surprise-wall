using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AniDefteri.Api.Data;   // 🚀 Üst harfe duyarlı gerçek klasör yolun kanka
using AniDefteri.Api.Models; // 🚀 Modellerin için gerçek yol

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

        // 📥 1) YENİ SORU EKLEME ENDPOINT'İ
        [HttpPost("add")]
        public async Task<IActionResult> AddQuestion([FromBody] QuizQuestion question)
        {
            if (string.IsNullOrWhiteSpace(question.QuestionText))
            {
                return BadRequest(new { Message = "Soru alanı boş bırakılamaz kanka!" });
            }

            _context.QuizQuestions.Add(question);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Soru başarıyla kapsüle gizlendi! 🧠💥" });
        }

        // 📤 2) ODANIN TÜM SORULARINI GETİRME ENDPOINT'İ
        [HttpGet("wall/{wallId}")]
        public async Task<IActionResult> GetWallQuestions(int wallId)
        {
            var questions = await _context.QuizQuestions
                .Where(q => q.WallId == wallId)
                .OrderBy(q => q.CreatedAt)
                .ToListAsync();

            return Ok(questions);
        }

        // 🗑️ 3) SORU SİLME ENDPOINT'İ
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.QuizQuestions.FindAsync(id);
            if (question == null) return NotFound();

            _context.QuizQuestions.Remove(question);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // 📝 4) SORU DÜZENLEME ENDPOINT'İ
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuizQuestion dto)
        {
            var question = await _context.QuizQuestions.FindAsync(id);
            if (question == null) return NotFound();

            question.QuestionText = dto.QuestionText;
            question.OptionA = dto.OptionA;
            question.OptionB = dto.OptionB;
            question.OptionC = dto.OptionC;
            question.OptionD = dto.OptionD;
            question.CorrectOption = dto.CorrectOption;
            question.CreatorName = dto.CreatorName;

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}