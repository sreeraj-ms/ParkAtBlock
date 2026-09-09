targetScope = 'subscription'

@description('Resource group for the ParkAtBlock UI.')
param resourceGroupName string

@description('Azure region for the UI resources.')
param location string = 'westus3'

@description('Globally unique App Service name for the UI.')
param webAppName string

@description('App Service Plan SKU. B1 is intended for the initial deployment.')
param skuName string = 'B1'

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
}

resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: '${webAppName}-plan'
  location: location
  scope: resourceGroup
  kind: 'app'
  sku: {
    name: skuName
    tier: 'Basic'
  }
  properties: {
    reserved: false
  }
}

resource webApp 'Microsoft.Web/sites@2024-11-01' = {
  name: webAppName
  location: location
  scope: resourceGroup
  kind: 'app'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      netFrameworkVersion: 'v8.0'
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '20'
        }
      ]
    }
  }
}

output webAppName string = webApp.name
output defaultHostName string = webApp.properties.defaultHostName
