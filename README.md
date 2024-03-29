# Redshape

[![Build Status](https://travis-ci.com/Spring3/redshape.svg?branch=master)](https://travis-ci.com/Spring3/redshape)
[![CircleCI](https://circleci.com/gh/Spring3/redshape/tree/master.svg?style=svg)](https://circleci.com/gh/Spring3/redshape/tree/master)

A time tracker for [Redmine](https://www.redmine.org) built on [Electron](https://github.com/electron/electron).

Re-designs the way tasks, task info, tracked time and communication is done on redmine.

The project was originally developed for a MVP portfolio showcase, but there is some roadmap planned with new features that might be added once I find enough of free time.

Thanks for using, or considering to use this project.

![Redshape Screenshot](https://user-images.githubusercontent.com/4171202/58926139-bbd6df00-8752-11e9-92bb-ddfdb5bce33d.png)

## Installation

### macOS

Download the latest [Redshape release](https://github.com/Spring3/redshape/releases/latest).

The application will automatically update when a new release is available.

### Windows

Download the latest [Redshape installer](https://github.com/Spring3/redshape/releases).

You can download the .exe installer or the web installer. Both automatically detect the system architecture and set up the correct version.

The application will automatically update when a new release is available.

### Linux

Download the latest [Redshape release](https://github.com/Spring3/redshape/releases/latest).

The application will automatically update when a new release is available.

## Development

If you don't have access to a deployed instance of redmine, you can now run it in docker

Unfortuantely, you will have to configure it then yourself

```
docker-compose -f docker-compose.yml up
```

Then after you run the project with `yarn dev`, use `http://localhost` as redmine endpoint on the login form and provide the credentials or the API token 

## FAQ

#### - I try to log in, but it returns an error
[As mentioned in the documentation to Redmine](https://www.redmine.org/projects/redmine/wiki/Rest_api#Authentication), you need to make sure that you enabled the REST API

#### - Markdown is displayed incorrectly
Please ask your Redmine admin user to check if it's enabled in `Administration -> General -> Text Formatting` menu. This path may change with the upcoming redmine releases, so please refer to Redmine documentation to find out exactly where this switch is located for your version of Redmine

#### - My antivirus / Defender / Mac OS warns that it's not safe to run this app
Mac OS build was signed by a **self-signed certificate**, while Windows and Linux builds **were not signed at all**. In such case, you will see this warnings upon download or running the application / installation, saying that this app is not safe to run or that it was provided by an unknown developer and is not safe to run.

#### - How to use timer controls

Timer controls allow to manually modify the time for the timer by (1 or 5 minutes back and forth) as well as write temporary comments. Using these, we can directly modify the time after the pause in the task. To enable it, toggle the "Use advanced timer controls" item in the Settings menu

#### - Idle behavior

Redshape can pause the timer if it detects the system is idle for a range of times (5, 10 o 15 minutes). It will warn with notifications (15s. warning time before pausing).

Optionally, it can automatically discard the idle time from the current timer when it is paused.

#### - More accurate progressbar

Issue progress slider can be changed with 1% step if configured (by default is 10%). 
Enable this if you have support in the server side (ruby, redmine) to use every percentage (33%, 81%, etc).

## License
[GPL-3.0](https://github.com/Spring3/redshape/blob/master/LICENSE.md)

Created by [Daniyil Vasylenko](https://github.com/Spring3)

## Contributors

[rNoz](https://github.com/rnoz) from [Group4Layers](https://www.group4layers.com)
