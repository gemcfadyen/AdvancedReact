import React, {Component} from 'react';
import {Mutation} from "react-apollo";
import Form from "./styles/Form";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import {Query} from "react-apollo";

export const SINGLE_ITEM_QUERY = gql`query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: {id: $id}) {
        id
        title
        description
        price
    }
}`

export const UPDATE_ITEM_MUTATION = gql`mutation UPDATE_ITEM_MUTATION($id: ID!
$title: String
$description: String
$price: Int){
    updateItem(id: $id,
        title: $title
        description: $description
        price: $price) {
        id
        title
        description
        price
    }

}`;

class UpdateItem extends Component {
  state = {};

  handleChange = (e) => {
    const {name, type, value} = e.target;
    const valueOfCorrectType = (type === "number") ? parseFloat(value) : value;
    this.setState({[name]: valueOfCorrectType});
  };

  updateItem = async (updateEvent, updateItemMutation) => {
    updateEvent.preventDefault();
    const response = await updateItemMutation({
      variables: {
        id: this.props.id,
        ...this.state
      }
    });
  }

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{id: this.props.id}}>
        {({data, loading}) => {
          if (loading) return <p> loading... </p>

          if (!data.item) return <p> No data found for id: {this.props.id}</p>
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItemFunction, {loading, error}) => (

                <Form onSubmit={e => this.updateItem(e, updateItemFunction)}>
                  <Error error={error}/>
                  <fieldset disabled={loading} aria-busy={loading}>

                    <label htmlFor="title">
                      Title
                      <input type="string" id="title" name="title" placeholder="title" required
                             defaultValue={data.item.title}
                             onChange={this.handleChange}/>
                    </label>

                    <label htmlFor="price">
                      Price
                      <input type="number" id="price" name="price" placeholder="price" required
                             defaultValue={data.item.price}
                             onChange={this.handleChange}/>
                    </label>

                    <label htmlFor="description">
                      Description
                      <input type="string" id="description" name="description" placeholder="description" required
                             defaultValue={data.item.description}
                             onChange={this.handleChange}/>
                    </label>

                    <button type="submit">Sav{loading ? "ing" : "e"} Changes</button>
                  </fieldset>
                </Form>
              )}
            </Mutation>

          )
        }}
      </Query>
    );
  }
}

export default UpdateItem;