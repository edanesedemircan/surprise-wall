namespace AniDefteri.Api.Models{
    public class AddMemoryDto{
        public int WallId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
}
}