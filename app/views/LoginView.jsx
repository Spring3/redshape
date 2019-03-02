import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Input, Labeled } from '../components/Input';
import { Formik } from 'formik';
import Joi from 'joi';
import RedmineAPI from '../redmine/api.js';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  grid-auto-rows: 200px;
  grid-template-areas:
    '. a a .'
    '. a a .';
`;

class LoginView extends Component {
  validate = ({ username, password, redmineDomain }) => ({
    username: _.get(Joi.validate(username, Joi.string().required()), 'error.message'),
    password: _.get(Joi.validate(password, Joi.string().required()), 'error.message'),
    redmineDomain: _.get(Joi.validate(redmineDomain, Joi.string().uri().required()), 'error.message')
  });

  onSubmit = (values, { setSubmitting }) => {
    console.log('Submitted', values);
    const api = RedmineAPI.initialize(values.redmineDomain);
    console.log('api', api);
    return api.login(values).then(console.log).then(() => setSubmitting(false));
  }

  render() {
    return (
      <Grid>
        <Formik
          initialValues={{ username: '', password: '', redmineDomain: '' }}
          validate={this.validate}
          onSubmit={this.onSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <form onSubmit={handleSubmit}>
              <Labeled
                label="Login"
                htmlFor="username"
              >
                <Input
                  type="text"
                  name="username"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                />
              </Labeled>
              {errors.username && touched.username && (<div>{errors.username}</div>) }
              <Labeled
                label="Password"
                htmlFor="password"
              >
                <Input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                />
              </Labeled>
              {errors.password && touched.password && (<div>{errors.password}</div>) }
              <Labeled
                label="Remdine Host"
                htmlFor="redmineDomain"
              >
                <Input
                  name="redmineDomain"
                  placeholder="https://redmine.example.com"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.host}
                />
              </Labeled>
              {errors.redmineDomain && touched.redmineDomain && (<div>{errors.redmineDomain}</div>) }
              <button type="submit" disabled={isSubmitting}>
              Submit
              </button>
              <div>{JSON.stringify(errors)}</div>
            </form>
          )}
        </Formik>
      </Grid>
    );
  }
}

export default LoginView;
