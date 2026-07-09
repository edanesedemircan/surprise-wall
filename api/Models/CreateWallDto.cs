namespace AniDefteri.Api.Models{
    public class CreateWallDto{
        public string Title {get;set;} = string.Empty;
        public string Theme {get; set;} = "default";
        public string TargetEmail {get; set;} = string.Empty;

        // oda için izinli mailler listesi, sayaç aktif mi?, sayaç süresi...
        public List<string> AllowedEmails {get; set;} = new();
        public bool IsCountdownActive {get; set;}
        public DateTime? TargetDate {get; set;}

        public string CreatorEmail {get;set;}

    }
}