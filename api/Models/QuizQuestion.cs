using System.ComponentModel.DataAnnotations;

namespace AniDefteri.Api.Models
{
    public class QuizQuestion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WallId { get; set; }

        [Required]
        public string QuestionText { get; set; } = string.Empty;

        [Required]
        public string OptionA { get; set; } = string.Empty;

        [Required]
        public string OptionB { get; set; } = string.Empty;

        [Required]
        public string OptionC { get; set; } = string.Empty;

        [Required]
        public string OptionD { get; set; } = string.Empty;

        [Required]
        public string CorrectOption { get; set; } = "A";

        public string CreatorName { get; set; } = "Anonim";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}