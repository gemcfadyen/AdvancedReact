import React from "react";
import {Query, Mutation} from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import PropTypes from "prop-types";

const ALL_USERS_QUERY = gql`
  query{
    users{
      id
      name
      email
      permissions
    }
  }
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
`;

const possiblePermissions = ["ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"];

const Permissions = (props) => (
  <Query query={ALL_USERS_QUERY}>
    {({data, loading, error}) => (
      <div>
        <Error error={error}/>
        <h2> Manage Permissions </h2>
        <Table>
          <thead>
          <tr>
            <th>
              Name
            </th>
            <th>Email</th>
            {possiblePermissions.map((permission, index) => {
              return <th key={index}>{permission}</th>
            })}
            <th>👇</th>
          </tr>
          </thead>
          <tbody>
          {data.users.map((user, index) => {
            return <UserPermission key={index} user={user}/>
          })}
          </tbody>
        </Table>
      </div>
    )}
  </Query>
);

class UserPermission extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }.isRequired)
  };

  state = {
    permissions: this.props.user.permissions
  };

  handlePermissionChange = (event) => {
    console.log("checked box");
    console.log(event.target);
    console.log(event.target.checked);
    const checkbox = event.target;
    let updatedPermissions = [...this.state.permissions];
    console.log(updatedPermissions);
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
    }

    console.log(updatedPermissions);
    this.setState({permissions: updatedPermissions})
  };

  render() {
    const user = this.props.user;
    console.log(user)

    return (
      <Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables={{
        permissions: this.state.permissions,
        userId: this.props.user.id
      }}>
        {(updatePermissionsFunction, {loading, error}) => (
          <>
            {error && <tr>
              <td colspan="9"><Error error={error}/></td>
            </tr>}
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map((permission, index) => (
                <td key={index}>
                  <label htmlFor={`${user.id}-permission-${permission}`}>
                    <input id={`${user.id}-permission-${permission}`} type={"checkbox"}
                           checked={this.state.permissions.includes(permission)} value={permission}
                           onChange={this.handlePermissionChange}/>
                  </label>
                </td>
              ))}
              <td>
                <SickButton type="button" disabled={loading}
                            onClick={updatePermissionsFunction}>Updat{loading ? "ing" : "e"}</SickButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>)
  }
}

export default Permissions;
