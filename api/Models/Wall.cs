namespace AniDefteri.Api.Models {
    public class Wall {

        public int Id {get; set; }
        public string Title {get; set;} =string.Empty;
        public string Theme {get; set;} = "Party";
        public string TargetEmail {get; set;} = string.Empty;

        // izinli emailler listesi
        public List<string> AllowedEmails {get; set;} = new();


        // admin email
        public string CreatorEmail {get;set;}

        // sayaç aktif mi, süresi, oluşturulma zamanı...
        public bool IsCountdownActive {get; set;} = false;
        public DateTime? TargetDate {get; set;} 
        public DateTime CreatedAt { get; set;} = DateTime.UtcNow;

    }
}