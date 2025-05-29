namespace Organizer.Server.Models.Assistant
{
    public class DailyTaskKpi
    {
        public DateTime Date { get; set; }
        public int TotalEstimatedHours { get; set; }
        public int CompletedTaskCount { get; set; }
        public int IncompleteTaskCount { get; set; }

        public double CompletionRate =>
            CompletedTaskCount + IncompleteTaskCount == 0
                ? 0
                : (double)CompletedTaskCount / (CompletedTaskCount + IncompleteTaskCount);
    }

}
