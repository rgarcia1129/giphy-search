import React from 'react';
import {Field, reduxForm, reset} from 'redux-form';
import {compose, bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {updateTags} from 'redux/tags/actions';

class TagForm extends React.Component {

  onSubmit = formProps => {
    const {tags} = formProps;
    const {actions, gifId, dispatch} = this.props;
    actions.updateTags(tags, gifId);
    dispatch(reset('tagForm'));
  }

  render(){
    const {handleSubmit } = this.props;
    return (
      <Form onSubmit={handleSubmit(this.onSubmit)} >
        <Form.Group controlId="tags" >
          <Field id='tags'
                name='tags'
                component='input'
                type='text'
                placeholder='ex: funny, animals, etc.'
                className='form-control'
                autoComplete='off'
              />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={false} style={{float: 'right'}}>
          Save
        </Button>
      </Form>
    );
  }
}

const validate = formProps => {
  const errors = {}

  if (!formProps.tags) {
    errors.tags = "Enter one or more tags";
  }

  return errors;
}

const mapStateToProps = (state) => {
  return {
    tags: state.tags
  }
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({updateTags}, dispatch)
  }
}

export default compose(connect(mapStateToProps, mapDispatchToProps), reduxForm({form:'tagForm', validate }))(TagForm);
