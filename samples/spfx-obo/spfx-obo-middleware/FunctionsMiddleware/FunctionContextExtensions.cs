using System.Net;
using System.Reflection;
using Microsoft.Azure.Functions.Worker;

namespace PnP.SPFxOBO.Middleware.FunctionsMiddleware
{
    internal static class FunctionContextExtensions 
    {
        internal static void SetHttpResponseStatusCode(this FunctionContext context, HttpStatusCode statusCode)
        {
            var coreAssembly = Assembly.Load("Microsoft.Azure.Functions.Worker.Core");
            var featureInterfaceName = "Microsoft.Azure.Functions.Worker.Context.Features.IFunctionBindingsFeature";
            var featureInterfaceType = coreAssembly.GetType(featureInterfaceName);
            var bindingsFeature = context.Features.Single(
                f => f.Key.FullName == featureInterfaceType.FullName).Value;
            var invocationResultProp = featureInterfaceType.GetProperty("InvocationResult");

            var grpcAssembly = Assembly.Load("Microsoft.Azure.Functions.Worker.Grpc");
            var responseDataType = grpcAssembly.GetType("Microsoft.Azure.Functions.Worker.GrpcHttpResponseData");
            var responseData = Activator.CreateInstance(responseDataType, context, statusCode);

            invocationResultProp.SetMethod.Invoke(bindingsFeature, new object[] { responseData });
        }

        internal static MethodInfo GetTargetFunctionMethod(this FunctionContext context)
        {
            // More terrible reflection code..
            // Would be nice if this was available out of the box on FunctionContext

            // This contains the fully qualified name of the method
            // E.g. IsolatedFunctionAuth.TestFunctions.ScopesAndAppRoles
            var entryPoint = context.FunctionDefinition.EntryPoint;

            var assemblyPath = context.FunctionDefinition.PathToAssembly;
            var assembly = Assembly.LoadFrom(assemblyPath);
            var typeName = entryPoint.Substring(0, entryPoint.LastIndexOf('.'));
            var type = assembly.GetType(typeName);
            var methodName = entryPoint.Substring(entryPoint.LastIndexOf('.') + 1);
            var method = type.GetMethod(methodName);
            return method;
        }
    }
}
