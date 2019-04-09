import React, {Component} from 'react';
import {Mutation} from "react-apollo";
import Router from "next/router"
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import gql from "graphql-tag";
import Error from "./ErrorMessage";

export const CREATE_ITEM_MUTATION = gql`mutation CREATE_ITEM_MUTATION(
$title: String!
$description: String!
$price: Int!
$image: String
$largeImage: String ){
    createItem(title: $title
        description: $description
        price: $price
        image: $image
        largeImage: $largeImage) {
        id
    }

}`;

class CreateItem extends Component {
  state = {
    title: "default title",
    description: "default description",
    image: "defaultimage.jpg",
    largeImage: "default-largeimage.jpg",
    price: 10
  };

  handleChange = (e) => {
    const {name, type, value} = e.target;
    console.log({name, type, value});
    const valueOfCorrectType = (type === "number") ? parseFloat(value) : value;
    this.setState({[name]: valueOfCorrectType});
  };

  uploadImage = async (image) => {
    const files = image.target.files;
    console.log("Uploading ", files);
    const data = new FormData();
    data.append('file', files[0]);
    data.append("upload_preset", "sickfits");

    //call the cloudinary api
    const res = await fetch("https://api.cloudinary.com/v1_1/georginam/image/upload", { method: "POST", body: data});

    const file = await res.json();
    console.log("file from cloudinary is ", file)

    this.setState({image: file.secure_url,
    largeImage: file.eager[0].secure_url});
  };

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItemFunction, {loading, error}) => (

          <Form onSubmit={async (e) => {
            //stop the form from submitting
            e.preventDefault();
            //call the mutation
            const result = await createItemFunction();
            //route user to product page
            console.log(result)
            Router.push({pathname:"/item", query:{id: result.data.createItem.id}})
          }}>
            <Error error={error}/>
            <fieldset disabled={loading} aria-busy={loading}>

              <label htmlFor="file">
               Image
                <input type="file" id="file" name="file" placeholder="upload an image" required value={this.state.file}
                       onChange={this.uploadImage}/>

                {this.state.image && <img src={this.state.image} width="200" alt="upload preview" />}
              </label>

              <label htmlFor="title">
                Title
                <input type="string" id="title" name="title" placeholder="title" required value={this.state.title}
                       onChange={this.handleChange}/>
              </label>

              <label htmlFor="price">
                Price
                <input type="number" id="price" name="price" placeholder="price" required value={this.state.price}
                       onChange={this.handleChange}/>
              </label>

              <label htmlFor="description">
                Description
                <input type="string" id="description" name="description" placeholder="description" required
                       value={this.state.description}
                       onChange={this.handleChange}/>
              </label>

              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;