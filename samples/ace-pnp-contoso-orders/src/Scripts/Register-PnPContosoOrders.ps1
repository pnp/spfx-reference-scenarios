<#
.SYNOPSIS
Registers a SharePoint Framework solution that includes an ACE (Adaptive Card Extension) into the App Catalog and handles the permission grants
.DESCRIPTION
.EXAMPLE
PS C:\> .\Register-PnPContosoOrders.ps1 -TenantName "mytenant" -Credentials $credentials
This will register an SPPKG into the App Catalog of a tenant with name mytenant.onmicrosoft.com and eventually using the provided credentials of a tenant admin account
#>
Param(
   [Parameter(Mandatory=$true, HelpMessage="Mandatory tenant name, like mytenant if your tenant name is mytenant.onmicrosoft.com")]
   [string]$TenantName,
   [Parameter(Mandatory = $false, HelpMessage="Optional tenant administration credentials")]
   [PSCredential]$Credentials,
   [Parameter(Mandatory = $false, HelpMessage="Optional to use browser-based authentication")]
   [switch]$LaunchBrowser = $false
)

if ($null -ne $Credentials) {
   # Connect to SPO
   Connect-PnPOnline https://$TenantName-admin.sharepoint.com/ -Credentials $Credentials
}
elseif ($LaunchBrowser) {
   Connect-PnPOnline https://$TenantName-admin.sharepoint.com/ -LaunchBrowser -Interactive
}
else {
   Connect-PnPOnline https://$TenantName-admin.sharepoint.com/
}


# Register the SPPKG in the App Catalog
$result = Add-PnPApp -Path .\contoso-orders.sppkg -Scope Tenant -Publish -Overwrite -SkipFeatureDeployment

# Trigger the app consent
$consentUrl = 'https://login.microsoftonline.com/common/adminconsent?client_id=a47390a4-f0cb-42ee-b3de-0a0af6e44f2d&redirect_uri=https://pnp-contoso-orders-dev.azurewebsites.net/api/grant&state=' + $TenantName
Start-Process $consentUrl

Write-Host "Please Consent the app registration and then Approve the permission request for API 'PnP.Contoso.Orders' and permission scope 'Orders.FullControl' in the SharePoint Online API Access page."
