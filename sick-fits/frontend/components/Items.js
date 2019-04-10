import React, {Component} from 'react';
import {Query} from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Item from "../components/Item";

export const ALL_ITEMS_QUERY = gql`
    query ALL_ITEMS_QUERY {
        items {
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
        <Query query={ALL_ITEMS_QUERY}>
          {
            ({data, error, loading}) => {
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
      </Centered>
    );
  }
}

export default Items;
