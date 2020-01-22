# Redshape

[![Build Status](https://travis-ci.com/Spring3/redshape.svg?branch=master)](https://travis-ci.com/Spring3/redshape)
[![CircleCI](https://circleci.com/gh/Spring3/redshape/tree/master.svg?style=svg)](https://circleci.com/gh/Spring3/redshape/tree/master)

A time tracker for [Redmine](https://www.redmine.org) built on [Electron](https://github.com/electron/electron).

> This repo is a fork of the original project. Have a look to the below sections and the document `rNoz changes` to see the new features (docs/news.md).
>
> Acknowledgements: Daniyil Vasylenko and Group4Layers (see the section `Acknowledgements`)

Re-designs the way tasks, task info, tracked time and communication is done on redmine.

The project was originally developed for a MVP portfolio showcase, but there is some roadmap planned with new features that might be added once I find enough of free time.

Thanks for using, or considering to use this project. I would love to hear some feedback as well as your suggestions and thoughts about what could be improved. If you have something to say, don't hesitate to [send me an email](mailto:redshape.app@gmail.com).

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

## License
[GPL-3.0](https://github.com/Spring3/redshape/blob/master/LICENSE.md)

Created by [Daniyil Vasylenko](https://github.com/Spring3)

## Major Contributors

rNoz <rnoz.commits@gmail.com> (Group4Layers member).

## FAQ

#### - I try to log in, but it returns an error
[As mentioned in the documentation to Redmine](https://www.redmine.org/projects/redmine/wiki/Rest_api#Authentication), you need to make sure that you enabled the REST API

#### - Markdown is displayed incorrectly
Please ask your Redmine admin user to check if it's enabled in `Administration -> General -> Text Formatting` menu. This path may change with the upcoming redmine releases, so please refer to Redmine documentation to find out exactly where this switch is located for your version of Redmine

#### - My antivirus / Defender / Mac OS warns that it's not safe to run this app
Mac OS build was signed by a **self-signed certificate**, while Windows and Linux builds **were not signed at all**. In such case, you will see this warnings upon download or running the application / installation, saying that this app is not safe to run or that it was provided by an unknown developer and is not safe to run.

## Acknowledgements

- [Daniyil Vasylenko](redshape.app@gmail.com): original author of this interesting and useful project.
- [Group4Layers](https://www.group4layers.com): it is possible to contribute to this repository and achieve the new features provided here thanks to this company and its efforts to promote and work with open source. A whole month of dedication has been given in hours assigned by the company.
