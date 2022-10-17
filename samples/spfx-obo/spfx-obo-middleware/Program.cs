using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults((config, builder) => {
    })
    .Build();

host.Run();
