using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AniDefteri.Api.Models
{
    public class Memory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WallId { get; set; }

        [Required]
        public string AuthorName { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("WallId")]
        public Wall? Wall { get; set; }

        public string? ImageUrl { get; set; }
        
    }
}