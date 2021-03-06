import React from "react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import propTypes from "prop-types";

export const CURRENT_USER_QUERY = gql`
    query {
        me {
            id
            email
            name
            permissions
        }
    }
`;

const User = props => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
);

User.propTypes = {
  children: propTypes.func.isRequired
}

export default User;

