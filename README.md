# Redshape

[![Build Status](https://travis-ci.com/Spring3/redshape.svg?branch=master)](https://travis-ci.com/Spring3/redshape)
[![CircleCI](https://circleci.com/gh/Spring3/redshape/tree/master.svg?style=svg)](https://circleci.com/gh/Spring3/redshape/tree/master)

A time tracker for [Redmine](https://www.redmine.org) built on [Electron](https://github.com/electron/electron).

> This repo is a fork of the original project. Have a look to the section `rNoz changes` to see the new features.
>
> I would like to integrate these changes in the original one, but until then, I use my own repo.
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

## Contributors

rNoz <rnoz.commits@gmail.com> (Group4Layers member).

## FAQ

#### - I try to log in, but it returns an error
[As mentioned in the documentation to Redmine](https://www.redmine.org/projects/redmine/wiki/Rest_api#Authentication), you need to make sure that you enabled the REST API

#### - Markdown is displayed incorrectly
Please ask your Redmine admin user to check if it's enabled in `Administration -> General -> Text Formatting` menu. This path may change with the upcoming redmine releases, so please refer to Redmine documentation to find out exactly where this switch is located for your version of Redmine

#### - My antivirus / Defender / Mac OS warns that it's not safe to run this app
Mac OS build was signed by a **self-signed certificate**, while Windows and Linux builds **were not signed at all**. In such case, you will see this warnings upon download or running the application / installation, saying that this app is not safe to run or that it was provided by an unknown developer and is not safe to run.

## rNoz changes

### Auth

- Login accepts both API or Username+Password as login method:

  ![](docs/changes/login_mode_api.png)

### Durations

- Duration: you can use hours, and it is rounded as it will be used in Redmine

  ![](docs/changes/accept_hours.png)

- Duration: hours are not positive enough (15s rounded => 0)

  ![](docs/changes/error_nonpositive_enough.png)

- Duration: empty

  ![](docs/changes/error_empty.png)

- Duration: negative

  ![](docs/changes/error_negative.png)

- Duration: duration formats (2 examples)

  ![](docs/changes/accept_duration_1.png)

  ![](docs/changes/accept_duration_2.png)

- Time Entries are casted to duration formats when editing. For example, this:

  ![](docs/changes/timeentries.png)

  When it is clicked, it is automatically converted to the most comfortable duration format:

  ![](docs/changes/timeentries_modal_duration.png)

- When tracking an issue:

  ![](docs/changes/timer.png)

  When it is stopped, it is properly filled:

  ![](docs/changes/timer_stop_modal_duration.png)

- Added info tooltip for the duration field:

  ![](docs/changes/tooltip.png)

### TimeEntryModal

- When closing the modal of a modified entry or non saved entry (stopped), we need to confirm:

  ![](docs/changes/timeentreymodal_confirm_modified.png)

- Validations in TimeEntryModal are performed per field (onBlur), to avoid annoying errors in fields we didn't modify yet.

### Tray

- Added tray, allowing to hide in tray/show window, because most of the time the Redshape window is not needed.

- Tray with pause/resume button of current timer (long/short issue subject):

  ![](docs/changes/tray_pause_long.png)
  ![](docs/changes/tray_resume_short.png)

- Tick optimizations when using Redshape in tray. This are debug messages not present in the app. They are just printed here to show
  the optimization. We reduce the CPU usage.

  ![](docs/changes/tracker_optimization.png)

- New icons are provided for the tray, showing when it is tracking an issue (play, pause) or not.

### Advanced Timer Controls

- The view can be advanced or simple. When using advanced view, we can use new buttons to modify the current time (1 or 5 minutes) and write temporary comments. Using these, we can directly modify the time in case we were interrupted in the task (avoid remembering those changes until the end). Also, the comments help us in workflows where our time entry can be hours long.

  ![](docs/changes/advanced_timer_controls_long.png)

  ![](docs/changes/advanced_timer_controls_short.png)

  When we finish, we have updated our TimeEntryModal:

  ![](docs/changes/advanced_timer_controls_to_time_entry.png)

### Idle behavior

- Redshape can pause the timer if it detects the system is idle for a range of times (5, 10 o 15 minutes). It will warn with notifications (15s. warning time before pausing).

- Optionally, it can automatically discard the idle time from the current timer when it is paused.

### Settings

- New settings menu to be used per user/redmine host.

  ![](docs/changes/settings_menu.png)

### Minor bugfixes

- There are other minor bugfixes and features not listed but can be read in the git log. Those are usually related with UX, propagating correctly the state, etc.

### Issue progress bars

- Progress (done ratio) shows a gradient of 5 colors between red-yellow-green (0, 20, 40, 60, 80, 100%).

  Time cap shows a green bar between 0-80% and yellow-green in the last 20%. When it is overtime (eg. 150%), a red bar is shown with the overtime proportion (eg. 50/150).

  Tooltips added showing the specific percentage value.

  ![](docs/changes/progressbars.png)

### Custom fields

- Custom fields are shown in the issue details page (if available).

  ![](docs/changes/custom_fields.png)

### Edit issue

- Progress (done ratio) can be edited in a new modal. It supports an input range to slide the percetage of progress (0 to 100). 

  ![](docs/changes/edit_issue_progress.png)


### AUR package

Electron-builder does not offer aur packages. Therefore, in the directory `support/package-aur` we can build those for ArchLinux/Manjaro distributions. It is "optimized" and just installs around 50MiB, using the system electron, as it is exposed here [issue 4059](https://github.com/electron-userland/electron-builder/issues/4059).

```sh
bash support/package-aur/manager.sh pack # can be omitted if using the archive from the repo
bash support/package-aur/manager.sh makepkg
```

Before publishing a release, you have to update the PKGBUILD:

```sh
# using npm script:
npm run release:aur

# alternatively, with the shell:
bash support/package-aur/manager.sh pack pkgbuild
```

The second target (`pkgbuild`) will update the version and md5sums of the PKGBUILD.

### Known issues

- Tray new icons should be ported for Mac (png to icns; png2icns gives black background).
- Changes not tested in Mac or Windows.
- One test is omitted from the original repo (TimeEntryModal, it should match the snapshot) because it never finishes (throws JS heap out of memory).
- As soon as Electron v8 is stable, it should be used (package.json). Redshape is prepared for future features (timeoutType), keeping the notification when the timer is paused due to system idle.

## Acknowledgements

- [Daniyil Vasylenko](redshape.app@gmail.com): original author of this interesting and useful project.
- [Group4Layers](https://www.group4layers.com): it is possible to contribute to this repository and achieve the new features provided here thanks to this company and its efforts to promote and work with open source. The two weeks of dedication have been given in hours assigned by the company.
