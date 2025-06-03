using Microsoft.SemanticKernel;
using Organizer.Server.Models.Assistant;
using System.Text;

namespace Organizer.Server.Plugins
{
    public class TaskAnalysisPlugin
    {
        [KernelFunction]
        public string FormatKpiSummary(List<DailyTaskKpi> kpis)
        {
            var sb = new StringBuilder();
            foreach (var kpi in kpis.OrderByDescending(k => k.Date))
            {
                sb.AppendLine($"Date: {kpi.Date:dd-MM-yyyy}, Estimated: {kpi.TotalEstimatedHours}h, Completion: {kpi.CompletionRate:P0}");
            }
            return sb.ToString();
        }
    }

}
