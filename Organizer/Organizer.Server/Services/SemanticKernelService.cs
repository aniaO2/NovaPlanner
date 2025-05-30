using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel;
using System.Diagnostics;

namespace Organizer.Server.Services
{
    public class SemanticKernelService
    {
        private readonly Kernel _kernel;

        public Kernel Kernel => _kernel;

        public SemanticKernelService(IConfiguration config)
        {
            var endpoint = config["AzureOpenAI:Endpoint"];
            var key = config["AzureOpenAI:Key"];
            var deployment = "gpt4.1-assistant";

            Debug.WriteLine($"Endpoint: {endpoint}");
            Debug.WriteLine($"Key: {key}");
            Debug.WriteLine($"Deployment: {deployment}");

            _kernel = Kernel.CreateBuilder()
                .AddAzureOpenAIChatCompletion(deployment, endpoint, key)
                .Build();
        }
    }
}
