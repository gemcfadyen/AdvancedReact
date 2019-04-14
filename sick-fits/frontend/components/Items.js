import React, {Component} from 'react';
import {Query} from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Item from "../components/Item";
import Pagination from "../components/Pagination";
import {perPage} from "../config"

export const ALL_ITEMS_QUERY = gql`
    query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
        items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
            id
            title
            price
            description
            image
            largeImage
        }
    }

`;

const Centered = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

class Items extends Component {
  render() {
    return (
      <Centered>
        <Pagination page={this.props.page}></Pagination>
        <Query query={ALL_ITEMS_QUERY} variables={{skip: this.props.page * perPage - perPage, first: perPage}}>
          {
            ({data, error, loading}) => {
              console.log("QUERY.......!")
              console.log(`page = ${this.props.page} and perpage is ${perPage}`)
              if (loading) {
                console.log("loading")
                return <p> Loading...</p>
              }

              if (error) {
                console.log("error")
                return <p> Error: {error.message}</p>
              }
              console.log(data)
              console.log(`data is ${data.items}`)
              return <ItemsList>
                {data.items.map((item) =>
                  <Item key={item.id} item={item}/>
                )}
              </ItemsList>
            }
          }
        </Query>
        <Pagination page={this.props.page}></Pagination>
      </Centered>
    );
  }
}

export default Items;
