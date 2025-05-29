using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel;

namespace Organizer.Server.Services
{
    public class SemanticKernelService
    {
        private readonly Kernel _kernel;

        public SemanticKernelService(IConfiguration config)
        {
            var endpoint = config["AzureOpenAI:Endpoint"];
            var key = config["AzureOpenAI:Key"];
            var deployment = "gpt4.1-assistant";

            _kernel = Kernel.CreateBuilder()
                .AddAzureOpenAIChatCompletion(deployment, endpoint, key)
                .Build();
        }
    }

}
