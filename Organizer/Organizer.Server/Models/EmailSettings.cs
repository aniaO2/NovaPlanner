namespace Organizer.Server.Models
{
    public class EmailSettings
    {
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = "NovaPlanner";
        public string Password { get; set; } = string.Empty;
        public string SmtpHost { get; set; } = "smtp.gmail.com";
        public int SmtpPort { get; set; } = 587;
    }

}
