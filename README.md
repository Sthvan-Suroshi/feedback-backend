# API Documentation

## Schema

![demo](![Schema Diagram](image.png))

## User Routes

### Register User

- **URL**: `http://localhost:8000/api/v1/register`
- **Method**: `POST`
- **Description**: Register a new user of type student or instructor.
- **Body**:
  ```json
  {
    "fullName": "string",
    "email": "string"
    "password": "string",
    "usn":"string"
    "accountType": "string"
    "department": "string"
  }
  ```

### Login User

- **URL**: `http://localhost:8000/api/v1/login`
- **Method**: `POST`
- **Description**: Login into the application.
- **Body**:
  ```json
  {
    "email": "string"
    "password": "string",
  }
  ```

### Logout User

- **URL**: `http://localhost:8000/api/v1/logout`
- **Method**: `POST`
- **Description**: Login into the application.
- **Headers:`Authorization: Bearer <token>`**

## Feedback Routes

### Submit Feedback

- **URL**: `http://localhost:8000/api/v1/response/:formId`
- **Method**: `POST`
- **Description**: Submit feedback for a form.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Body**:
  ```json
  {
    "responses": [
      {
        "questionId": "string",
        "answer": "string"
      }
    ]
  }
  ```

### Check Feedback Submission

- **URL**: `http://localhost:8000/api/v1/exists/:formId`
- **Method**: `GET`
- **Description**: Check if feedback has been submitted for a form.

### Headers:

- `Authorization`: `Bearer <token>`

## Get All Feedbacks for a Form

- **URL**: `http://localhost:8000/api/v1/all/response/:formId`
- **Method**: `GET`
- **Description**: Get all feedbacks submitted for a form.

### Headers:

- `Authorization`: `Bearer <token>`

## Image Feedback Routes

### Upload Image Feedback

- **URL**: `/upload`
- **Method**: `POST`
- **Description**: Upload image feedback.

#### Headers:

- **Authorization**: `Bearer <token>`

#### Body:

- `Multipart/form-data` with an image file.

### Edit Image Feedback

- **URL**: `http://localhost:8000/api/v1/edit/:id`
- **Method**: `PATCH`
- **Description**: Edit an existing image feedback.

#### Headers:

- **Authorization**: `Bearer <token>`

#### Body:

- `Multipart/form-data` with an image file.

### Delete Image Feedback

- **URL**: `http://localhost:8000/api/v1/delete/:id`
- **Method**: `DELETE`
- **Description**: Delete an image feedback.

#### Headers:

- **Authorization**: `Bearer <token>`

### Get Image Feedback

- **URL**: `http://localhost:8000/api/v1/:id`
- **Method**: `GET`
- **Description**: Get a specific image feedback.

#### Headers:

- **Authorization**: `Bearer <token>`

### Get All User Image Feedbacks

- **URL**: `http://localhost:8000/api/v1/user/image-responses`
- **Method**: `GET`
- **Description**: Get all image feedbacks submitted by the current user.

#### Headers:

- **Authorization**: `Bearer <token>`

## Form Routes

### Create Form

- **URL**: `http://localhost:8000/api/v1/`
- **Method**: `POST`
- **Description**: Create a new form.

#### Headers:

- **Authorization**: `Bearer <token>`

- #### Body:

```json
{
  "title": "string",
  "description": "string",
  "questions": [
    {
      "question": "string",
      "options": ["string"]
    }
  ]
}
```

### Get Form Details

- **URL**: `http://localhost:8000/api/v1/:formId`
- **Method**: `GET`
- **Description**: Get details of a form.

#### Headers:

- **Authorization**: `Bearer <token>`

### Update Form

- **URL**: `http://localhost:8000/api/v1/:formId`
- **Method**: `PATCH`
- **Description**: Update a form.

#### Headers:

- **Authorization**: `Bearer <token>`

#### Body:

```json
{
  "title": "string",
  "description": "string",
  "questions": [
    {
      "question": "string",
      "options": ["string"]
    }
  ]
}
```

### Delete Form

- **URL**: `http://localhost:8000/api/v1/:formId`
- **Method**: `DELETE`
- **Description**: Delete a form.

#### Headers:

- **Authorization**: `Bearer <token>`

### Update Question

- **URL**: `http://localhost:8000/api/v1/question/:questionId`
- **Method**: `PATCH`
- **Description**: Update a question in a form.

#### Headers:

- **Authorization**: `Bearer <token>`

#### Body:

```json
{
  "question": "string",
  "options": ["string"]
}
```

### Delete Question

- **URL**: `http://localhost:8000/api/v1/question/:questionId`
- **Method**: `DELETE`
- **Description**: Delete a question from a form.

#### Headers:

- **Authorization**: `Bearer <token>`

### Get All Forms Created by User

- **URL**: `http://localhost:8000/api/v1/user/all-forms`
- **Method**: `GET`
- **Description**: Get all forms created by the current user.

#### Headers:

- **Authorization**: `Bearer <token>`

### Get All Forms by Department

- **URL**: `http://localhost:8000/api/v1/department/all-forms`
- **Method**: `GET`
- **Description**: Get all forms by department.

#### Headers:

- **Authorization**: `Bearer <token>`

### Get All Forms (Admin Only)

- **URL**: `http://localhost:8000/api/v1/admin/all-forms`
- **Method**: `GET`
- **Description**: Get all forms (admin only).

#### Headers:

- **Authorization**: `Bearer <token>`

### Toggle Form Publish Status

- **URL**: `http://localhost:8000/api/v1/your-forms/toggle-publish`
- **Method**: `PATCH`
- **Description**: Toggle the publish status of a form.

#### Headers:

- **Authorization**: `Bearer <token>`

```

```
