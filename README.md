# HandballGamesCollector
Collects and stores handball games via azure

## Status
  
[![Continuous-Integration](https://github.com/Blune/HandballGamesCollector/actions/workflows/ci-pipeline.yaml/badge.svg)](https://github.com/Blune/HandballGamesCollector/actions/workflows/ci-pipeline.yaml)    
[![Continuous-Deployment](https://github.com/Blune/HandballGamesCollector/actions/workflows/cd-pipeline.yaml/badge.svg)](https://github.com/Blune/HandballGamesCollector/actions/workflows/cd-pipeline.yaml)

## Idea
I need to know the game dates of a certain Handball team.
Since I tend to forget to carry the card with all the dates with me this project should query the dates for me and store them in an azure blob storage.
To follow the devops principles all of this should happen automatically.
So these steps happen:

1. Terraform creates all the resources in azure
2. The code is checked and deployed by CI/CD pipelines
3. An azure function will collect all the dates, filter them for the team M am interested in and store them in a blob container twice a week
4. Terraform will create Shared Access Signatures and place them in html files so that the data can be consumed.
5. A Progressive Web App will be hosted on Azure and display the game dates on my smartphone

So basically like this:
![Workflow graph](documentation/workflow.png)

## What terraform creates in detail

![Terraform graph](documentation/terraform_resources.svg)

## Display the data in a Progressive Wep App

This is a preview of how the dummy PWA looks at the moment    
![PWA](documentation/pwa.png)
