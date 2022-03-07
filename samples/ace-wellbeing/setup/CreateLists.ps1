$homeSite = Read-Host -Prompt 'Enter the URL of the home site of your tenant';
Connect-PnPOnline $homeSite -UseWebLogin;

$wellbeingListTitle = "Wellbeing";
$wellbeingConfigListTitle = "Wellbeing_Configuration";
$wellbeingGroupMailAddress = Read-Host -Prompt 'Enter the email address of the wellbeing group';
$wellbeingDocumentsLibraryName = Read-Host -Prompt 'Enter the name of the document library where the wellbeing documents are present';

Write-Host "Creating the wellbeing list...";
$wblist = New-PnPList -Title $wellbeingListTitle -Template GenericList;
$title = Get-PnPField -List $wellbeingListTitle -Identity Title;
$title.Required = $false;
$title.Update();
Invoke-PnPQuery;

Write-Host "Creating columns in the wellbeing list...";
$status = Add-PnPField -List $wellbeingListTitle -DisplayName Status -InternalName Status -Type Choice -AddToDefaultView -Choices "Requested","Approved","Declined";
$status.DefaultValue = "Requested";
$status.Update();
Invoke-PnPQuery;

$date = Add-PnPField -List $wellbeingListTitle -DisplayName Date -InternalName Date -Type DateTime -AddToDefaultView;
$emp = Add-PnPField -List $wellbeingListTitle -DisplayName Employee -InternalName Employee -Type User -AddToDefaultView;
$comments = Add-PnPField -List $wellbeingListTitle -DisplayName Comments -InternalName Comments -Type Note -AddToDefaultView;
$reviewcomment = Add-PnPField -List $wellbeingListTitle -DisplayName ReviewComment -InternalName ReviewComment -Type Note -AddToDefaultView;
$polocydocument = Add-PnPField -List $wellbeingListTitle -DisplayName PolicyDocument -InternalName PolicyDocument -Type URL -AddToDefaultView;

Write-Host "Changing list permissions so that visitors can contribute"
Set-PnPList -Identity $wellbeingListTitle -BreakRoleInheritance -CopyRoleAssignments;
$visitors = Get-PnPGroup -AssociatedVisitorGroup;
Set-PnPGroupPermissions -Identity $visitors -List $wellbeingListTitle -AddRole @('Contribute');

Write-Host "Creating the wellbeing configuration list...";
$wbclist = New-PnPList -Title $wellbeingConfigListTitle -Template GenericList;

Write-Host "Adding value field to the wellbeing configuration list...";
$valuefield = Add-PnPField -List $wellbeingConfigListTitle -DisplayName Value -InternalName Value -Type Note -AddToDefaultView;

Write-Host "Adding items to the wellbeing configuration list...";
$li = Add-PnPListItem -List $wellbeingConfigListTitle -Values @{"Title" = "WellbeingRequestsListName"; "Value"=$wellbeingListTitle};
$li = Add-PnPListItem -List $wellbeingConfigListTitle -Values @{"Title" = "WellbeingGroupMailAddress"; "Value"=$wellbeingGroupMailAddress};
$li = Add-PnPListItem -List $wellbeingConfigListTitle -Values @{"Title" = "WellbeingDocumentsDriveName"; "Value"=$wellbeingDocumentsLibraryName};

Write-Host "Done";