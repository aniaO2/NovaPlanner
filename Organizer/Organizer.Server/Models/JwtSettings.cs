﻿namespace Organizer.Server.Models
{
    public class JwtSettings
    {
        public string Secret { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public int ExpiryInMinutes { get; set; }
    }
}
