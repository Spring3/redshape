# Server

Some features need server-side support, usually via plugins.

Here are specified the needs for every feature.

## Features

### Tags

To show the redmine tags (plugin), we need to extend its behavior, supporting:

Endpoint: `/issues.json?include=tags`

Endpoint: `/issues/:id.json?include=tags`

In both cases we need a 200 OK with json data. As an example, we show the `issues.json` response:

```json
{
  "issues": [
    {
      "id": 573,
      "project": {
        "id": 13,
        "name": "XXX"
      },
      "tracker": {
        "id": 2,
        "name": "Feature"
      },
      "status": {
        "id": 2,
        "name": "In Progress"
      },
      "priority": {
        "id": 2,
        "name": "Normal"
      },
      "author": {
        "id": 5,
        "name": "XXXX"
      },
      "subject": "YYYYYY",
      "description": "",
      "start_date": "2020-01-22",
      "due_date": "2020-01-31",
      "done_ratio": 10,
      "is_private": false,
      "estimated_hours": 5,
      "custom_fields": [
        {
          "id": 10,
          "name": "FieldAAA",
          "value": null
        }
      ],
      "created_on": "2020-01-22T16:25:49Z",
      "updated_on": "2020-01-22T16:48:46Z",
      "closed_on": null,
      "total_estimated_hours": 5,
      "spent_hours": 7,
      "total_spent_hours": 7
    },
    {
      "id": 572,
      "project": {
        "id": 13,
        "name": "XXX"
      },
      "tracker": {
        "id": 5,
        "name": "Task"
      },
      "status": {
        "id": 4,
        "name": "Feedback"
      },
      "priority": {
        "id": 2,
        "name": "Normal"
      },
      "author": {
        "id": 1,
        "name": "Redmine Admin"
      },
      "assigned_to": {
        "id": 5,
        "name": "YYYYY"
      },
      "subject": "XXXXXXXX",
      "description": "",
      "start_date": "2020-01-22",
      "due_date": "2020-01-27",
      "done_ratio": 30,
      "is_private": false,
      "estimated_hours": 3,
      "created_on": "2020-01-22T08:59:36Z",
      "updated_on": "2020-01-25T15:51:13Z",
      "closed_on": null,
      "total_estimated_hours": 3,
      "spent_hours": 12,
      "total_spent_hours": 12,
      "tags": [
        "auth",
        "supertag"
      ]
    }
  ],
  "total_count": 137,
  "offset": 0,
  "limit": 5
}
```

Every issue may have a field:
- `tags` (optional): `null`, `undefined` or `string[]` (list of strings).

Being those strings the tags themselves. In any other case there are no tags.

### More fields in issues

To show more values regarding time log when listing issues:

Endpoint: `/issues.json`

Should return 200 OK with every issue json object with optional fields:

- `total_estimated_hours` (optional): `integer`, `float`, `null` or `undefined`.
- `spent_hours` (optional): `integer`, `float`, `null` or `undefined`.
- `total_spent_hours` (optional): `integer`, `float`, `null` or `undefined`.

### Subtasks

To show the number of subtasks when listing issues:

Endpoint: `/issues.json?include=children`

Should return 200 OK with every issue json object with optional fields:

- `children` (optional): `Child[]`, `null` or `undefined`.

Being `Child` an object with:

- `id`: `number`
- `tracker`: `null`, `undefined` or an object composed of:
  - `id`: `number`
  - `name`: `string`

### Parent with tracker colored

Endpoing: `/issues/:id.json` and `/issues.json`

Should return 200 OK with the issue / every issue json object with the optional field:

- `parent` (optional): `null`, `undefined` or an object composed of:
  - `id`: `number`
  - `tracker`: `null`, `undefined` or an object composed of:
    - `id`: `number`
    - `name`: `string`

### Transitions

To be able to modify the issue priority and status.

Endpoint: `/issues/:id.json?include=transitions`

It needs a 200 OK response with values like these:

```json
{
  "issue": {
    "id": 570,
    "project": {
      "id": 16,
      "name": "Group4Layers"
    },
    "tracker": {
      "id": 2,
      "name": "Feature"
    },
    "status": {
      "id": 4,
      "name": "Feedback"
    },
    "priority": {
      "id": 5,
      "name": "Immediate"
    },
    "author": {
      "id": 5,
      "name": "XXXXX"
    },
    "assigned_to": {
      "id": 5,
      "name": "XXXXXX"
    },
    "subject": "Test",
    "description": "Something",
    "start_date": "2020-01-12",
    "due_date": null,
    "done_ratio": 60,
    "is_private": false,
    "estimated_hours": 1.5744444444444445,
    "total_estimated_hours": 1.5744444444444445,
    "spent_hours": 3.5833333333333335,
    "total_spent_hours": 3.5833333333333335,
    "custom_fields": [
      {
        "id": 10,
        "name": "Field AAAA",
        "value": null
      },
      {
        "id": 11,
        "name": "Field BBB",
        "value": null
      }
    ],
    "created_on": "2020-01-12T12:33:28Z",
    "updated_on": "2020-01-21T07:57:20Z",
    "closed_on": null,
    "transitions": {
      "status": [
        {
          "id": 2,
          "name": "In Progress",
          "is_closed": false,
          "position": 2,
          "default_done_ratio": null
        },
        {
          "id": 4,
          "name": "Feedback",
          "is_closed": false,
          "position": 3,
          "default_done_ratio": null
        },
        {
          "id": 5,
          "name": "Closed",
          "is_closed": true,
          "position": 5,
          "default_done_ratio": null
        }
      ],
      "priority": [
        {
          "id": 1,
          "name": "Low",
          "position": 1,
          "is_default": false,
          "active": true,
          "project_id": null,
          "parent_id": null,
          "position_name": "lowest"
        },
        {
          "id": 2,
          "name": "Normal",
          "position": 2,
          "is_default": true,
          "active": true,
          "project_id": null,
          "parent_id": null,
          "position_name": "default"
        },
        {
          "id": 3,
          "name": "High",
          "position": 3,
          "is_default": false,
          "active": true,
          "project_id": null,
          "parent_id": null,
          "position_name": "high4"
        },
        {
          "id": 4,
          "name": "Urgent",
          "position": 4,
          "is_default": false,
          "active": true,
          "project_id": null,
          "parent_id": null,
          "position_name": "high3"
        },
        {
          "id": 5,
          "name": "Immediate",
          "position": 5,
          "is_default": false,
          "active": true,
          "project_id": null,
          "parent_id": null,
          "position_name": "high2"
        },
        {
          "id": 25,
          "name": "Unknown",
          "position": 6,
          "is_default": false,
          "active": true,
          "project_id": null,
          "parent_id": null,
          "position_name": "highest"
        }
      ]
    }
  }
}
```

The issue may have:

-  `transitions`: `Transition` (object of transitions).

`Transition` is composed of two possible keys:
- `status`: `Status[]` (list of Status).
- `priority`: `Priority[]` (list of Priority).

Those lists should have the current state and the possible states that the current user could change to.

`Status` should have:
- `id`: `integer`.
- `name`: `string`. Name of the status.
- `position`: `integer`. Order of the status compared with the rest.

`Priority` should have:
- `id`: `integer`.
- `name`: `string`. Name of the priority.
- `position`: `integer`. Order of the priority compared with the rest.

### Custom Fields

This feature allows editing custom fields when editing the issue and when editing/creating time entries.

The functionality is quite ad-hoc to the Group4Layers usage, because there are many use cases with custom fields. Examples:
- We use `float` or `list` custom fields for issue, but we never use `regexp`, therefore, that is not implemented.
- We use issue custom fields for all trackers, therefore, we won't check applicability for the current tracker.

Therefore, expect to work if you use the same type of custom fields as us. In case you want more, do a PR or request them.

Endpoint: `/public_custom_fields.json`

It needs a 200 OK response with values like these:

```json
{
  "public_custom_fields": [
    {
      "id": 100,
      "name": "Field XXX",
      "customized_type": "issue",
      "field_format": "list",
      "regexp": "",
      "min_length": null,
      "max_length": null,
      "is_required": true,
      "is_filter": true,
      "searchable": true,
      "multiple": false,
      "default_value": "Type 1",
      "visible": true,
      "possible_values": [
        {
          "value": "Type 1",
          "label": "Type 1"
        },
        {
          "value": "Type 2",
          "label": "Type 2"
        }
      ],
      "trackers": [
        {
          "id": 3,
          "name": "Support"
        },
        {
          "id": 2,
          "name": "Feature"
        },
        {
          "id": 1,
          "name": "Bug"
        }
      ],
      "roles": [],
      "description": "",
      "is_computed": false,
      "formula": null
    },
    {
      "id": 230,
      "name": "Field YYY",
      "customized_type": "time_entry",
      "field_format": "int",
      "regexp": "",
      "min_length": null,
      "max_length": null,
      "is_required": false,
      "is_filter": false,
      "searchable": false,
      "multiple": false,
      "default_value": "",
      "visible": true,
      "trackers": [],
      "roles": [],
      "description": "Something about Field YYY",
      "is_computed": false,
      "formula": null
    },
  ]
}
```

Every custom field returned should be editable by the user querying the endpoint.

The json has many fields and possibilities, but only some of them are processed.
More variations can be adapted under request.

The following fields should be:

- `name`: `string` type, to be shown as a label in forms.
- `customized_type`: `"time_entry"` or `"issue"`.
- `description` (optional): `null`, `undefined` or `string`. To be shown as tooltip.
- `field_format`: `"list"`, `"string"`, `"float"`, `"int"`, `"bool"`, `"text"`, `"date"` or `"link"`.
- `is_required`: `true` or `false`.
- `default_value`: `string`, to be used when creating a new Time Entry.
- `visible`: `true`.
- `multiple`: `false` or `true`. Only valid if used with type `"list"`.
- `possible_values`: `[]` or `Value[]` (list of Value). Value: `{"value": "<string>", "label": "<string>"}`.
- `is_computed` (optional): `null`, `undefined` or `false`.
- `position` (optional): numeric order of the field.

In case it does not match any of these, the custom field is discarded.

The fields:
- `regexp`
- `min_length`
- `max_length`

Are not processed (and those not listed). Therefore, no client-side validation is performed. When sending
to the server, it will answer with an specific error if was not valid (server-side validation/requirements).

The `default_value` is only assigned to the field when creating a new `TimeEntry`.

To be considered an active/editable custom field, the field `visible` should be true.

The field `"text"` is mapped as an `input`, not as a `textarea`.

### Avatar

This feature allows showing the avatar image in the menu if it is server-side supported,
instead of the red bubble with the first letter of the user name.

It needs support from two endpoints:

Endpoint: `/users/current.json`

It needs a 200 OK response with values like these:

```json
{
  "user": {
    "id": 3,
    "login": "<username>",
    "admin": false,
    "firstname": "<Name>",
    "lastname": "<Surname>",
    "mail": "<email@address.org>",
    "created_on": "2010-10-10T00:45:00Z",
    "last_login_on": "2020-01-01T00:00:00Z",
    "api_key": "<api-key>",
    "avatar_id": 5
  }
}
```

The optional `avatar_id` key, if given, should be a number.

This number should match the identifier to access the avatar (eg. thumbnail)
image in the next endpoint:

Endpoint: `/people/avatar?id=$ID`, replacing `$ID` with this number (`avatar_id`).

And finally, it returns a 200 OK response with a binary stream of data with the contents of the image (eg. png),
to be consumed by axios as a `arraybuffer`. It works with png and jpeg images (both tested).

Currently, the expected (optimal) image returned should be 48x48 pixels.

In case there is are valid endpoints, wrong `avatar_id` (id) or non valid response (wrong image payload),
it will provide the red bubble with the first letter of the user name as a fallback.
