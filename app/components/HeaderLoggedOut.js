import React, { useEffect, useContext } from "react";
import Axios from "axios";
import DispatchContext from "../DispatchContext";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";

function HeaderLoggedOut(props) {
  const appDispatch = useContext(DispatchContext);

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
    },
    password: {
      value: "",
      hasErrors: false,
      message: "",
    },
    submitCount: 0,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "inputUsername":
        draft.username.hasErrors = false;
        draft.username.value = action.value;

        return;
      case "inputPassword":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        return;
      case "submitForm":
        if (draft.username.value.length < 1) {
          draft.username.hasErrors = true;
          draft.username.message = "You must introduce a username";
        }
        if (draft.password.value.length < 1) {
          draft.password.hasErrors = true;
          draft.password.message = "You must introduce a password";
        }
        if (!draft.username.hasErrors && !draft.password.hasErrors) {
          draft.submitCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/login",
            {
              username: state.username.value,
              password: state.password.value,
            },
            { cancelToken: ourRequest.token }
          );
          if (response.data) {
            console.log(response.data);
            appDispatch({ type: "login", data: response.data });
            appDispatch({
              type: "flashMessage",
              value: "Congrats you have succesfully logged in",
            });
          } else {
            appDispatch({ type: "failedAction" });
            appDispatch({
              type: "flashMessage",
              value: "Incorrect username or password",
            });
          }
        } catch (e) {
          console.log("There was a problem.");
        }
      }

      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.submitCount]);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({
      type: "inputUsername",
      value: state.username.value,
    });
    dispatch({
      type: "inputPassword",
      value: state.password.value,
    });
    dispatch({ type: "submitForm" });
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            onChange={(e) =>
              dispatch({
                type: "inputUsername",
                value: e.target.value,
              })
            }
            name="username"
            className="form-control form-control-sm input-dark"
            type="text"
            placeholder="Username"
            autoComplete="off"
          />
          <CSSTransition
            in={state.username.hasErrors}
            timeout={330}
            classNames="is-invalid"
            unmountOnExit
          >
            <div className="alert alert-danger small is-invalid">
              {state.username.message}
            </div>
          </CSSTransition>
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            onChange={(e) =>
              dispatch({
                type: "inputPassword",
                value: e.target.value,
              })
            }
            name="password"
            className="form-control form-control-sm input-dark"
            type="password"
            placeholder="Password"
          />
          <CSSTransition
            in={state.password.hasErrors}
            timeout={330}
            classNames="is-invalid"
            unmountOnExit
          >
            <div className="alert alert-danger small is-invalid">
              {state.password.message}
            </div>
          </CSSTransition>
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
