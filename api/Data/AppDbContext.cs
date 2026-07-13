using Microsoft.EntityFrameworkCore;
using AniDefteri.Api.Models;

namespace AniDefteri.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Wall> Walls { get; set; }
        public DbSet<Memory> Memories { get; set; } 
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
    }
}