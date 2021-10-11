// simulate getting products from DataBase
const products = [
  { name: "Apple", country: "Italy", cost: 3, instock: 10 },
  { name: "Orange", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  //console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

//------------------------------------------------------------------------------
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  //console.log(`useDataApi called`);
  useEffect(() => {
    //console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};
//-----------------------------------------------------------------------------------
const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:8082/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:8082/products",
    {
      data: [],
    }
  );
  //console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    if(item[0].instock == 0 )return;
    item[0].instock = item[0].instock-1;
    setCart([...cart, ...item]);
  
    //doFetch(query);
  };
  const deleteCartItem = (index) => {
    
    console.log(cart);
    let itemDeleted = cart[index];
    let newCart = cart.filter((item, i) => index != i);
    console.log("item deleted: " + itemDeleted);

    items.map((item) => {
      if (item.name === itemDeleted.name) {
          item.instock = item.instock + 1;
      }
    });
    setItems(items);
    setCart(newCart);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <div
          className="card mb-3"
          style={{ maxWidth: "450px", height: "10rem" }}
        >
          <div className="row g-0">
            <div className="col-md-4">
              <Image
                src={photos[index % 4]}
                fluid
                rounded
                className="align-self-start"
              ></Image>
            </div>
            <div className="col-md-4">
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">Price: $ {item.cost}</p>
                <p className="card-text">
                  <small className="text-muted">In Stock: {item.instock}</small>
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-body d-flex justify-content-center">
                <div></div>
                <input
                  name={item.name}
                  type="submit"
                  onClick={addToCart}
                  value="Add to Cart"
                  className="btn btn-primary"
                  style={{ top: "50%" }}
              
                ></input>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    //console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((item) => {
      let { name, country, cost, instock } = item;
      let t = items.find((element) => element.name == name);
      //console.log("test: " + t.name);
      instock = instock + t.instock;
      //console.log("totalStock: " + instock);
      return { name, country, cost, instock };
    });

    //console.log(`newItems ${JSON.stringify(newItems)}`);
    setItems(newItems);
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <h2>Product List</h2>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h2>Cart Contents</h2>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h2>CheckOut </h2>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:8082/${query}`);
            //console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <div>
            <input
              size="50"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              ReStock Products
            </button>
          </div>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
