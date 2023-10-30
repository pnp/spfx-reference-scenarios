using System.Net;
using System.Reflection;
using Microsoft.Azure.Functions.Worker;

namespace Contoso.Retail.Demo.Backend.FunctiosMiddleware
{
    internal static class FunctionContextExtensions 
    {
        internal static void SetHttpResponseStatusCode(this FunctionContext context, HttpStatusCode statusCode)
        {
            var coreAssembly = Assembly.Load("Microsoft.Azure.Functions.Worker.Core");
            var featureInterfaceName = "Microsoft.Azure.Functions.Worker.Context.Features.IFunctionBindingsFeature";
            var featureInterfaceType = coreAssembly.GetType(featureInterfaceName);
            var bindingsFeature = context.Features.Single(
                f => f.Key.FullName == featureInterfaceType?.FullName).Value;
            var invocationResultProp = featureInterfaceType?.GetProperty("InvocationResult");

            var grpcAssembly = Assembly.Load("Microsoft.Azure.Functions.Worker.Grpc");
            var responseDataType = grpcAssembly.GetType("Microsoft.Azure.Functions.Worker.GrpcHttpResponseData");
            if (responseDataType != null)
            {
                var responseData = Activator.CreateInstance(responseDataType, context, statusCode);
                if (responseData != null)
                {
                    invocationResultProp?.SetMethod?.Invoke(bindingsFeature, new object[] { responseData });
                }
            }
        }

        internal static MethodInfo GetTargetFunctionMethod(this FunctionContext context)
        {
            // This contains the fully qualified name of the method
            // E.g. IsolatedFunctionAuth.TestFunctions.ScopesAndAppRoles
            var entryPoint = context.FunctionDefinition.EntryPoint;

            var assemblyPath = context.FunctionDefinition.PathToAssembly;
            var assembly = Assembly.LoadFrom(assemblyPath);
            var typeName = entryPoint.Substring(0, entryPoint.LastIndexOf('.'));
            var type = assembly.GetType(typeName);
            var methodName = entryPoint.Substring(entryPoint.LastIndexOf('.') + 1);
            var method = type?.GetMethod(methodName);

            if (method == null)
            {
                throw new Exception($"Could not find method {entryPoint} in assembly {assemblyPath}");
            }
            
            return method;
        }
    }
}
