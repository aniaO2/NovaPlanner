namespace Organizer.Server.Models.Assistant
{
    public class EvaluateRequest
    {
        public string UserId { get; set; }
        public List<TaskItem> TodayTasks { get; set; }
    }
}
