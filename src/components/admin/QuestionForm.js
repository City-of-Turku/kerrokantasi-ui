/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v1';
import MultiLanguageTextField, {TextFieldTypes} from '../forms/MultiLanguageTextField';
import {Button, ProgressBar} from 'react-bootstrap';
import Icon from '../../utils/Icon';
import {FormattedMessage} from 'react-intl';
import getAttr from '../../utils/getAttr';

export class QuestionForm extends React.Component {
  /**
   * Delete an existing question from a section
   */
  handleDeleteExistingQuestion = () => {
    const {question, sectionId} = this.props;
    if (question.id && sectionId) {
      this.props.onDeleteExistingQuestion(sectionId, question.id);
    }
  }

  /**
   * Returns editable form for questions
   * @returns {JSX.Element}
   */
  getEditableForm = () => {
    const {question, sectionId, addOption, deleteOption, sectionLanguages, onQuestionChange} = this.props;
    return (
      <div className="question-form" key={question.type}>
        <MultiLanguageTextField
          labelId=" "
          maxLength={1000}
          name="abstract"
          onBlur={(value) => onQuestionChange('text', sectionId, question.frontId || question.id, "", value)}
          value={question.text}
          languages={sectionLanguages}
          fieldType={TextFieldTypes.TEXTAREA}
          placeholderId="questionTextPlaceholder"
        />
        {question.options.map((option, index) =>
          <div style={{display: 'flex'}} key={uuid()}>
            <div style={{flex: '19'}}>
              <MultiLanguageTextField
                labelId="option"
                showLabel
                label={index + 1}
                name="content"
                onBlur={(value) => onQuestionChange('option', sectionId, question.frontId || question.id, index, value)}
                rows="10"
                value={option.text || {}}
                languages={sectionLanguages}
                placeholderId="questionOptionPlaceholder"
              />
            </div>
            <div style={{flex: '1', marginTop: '48px', marginLeft: '15px'}}>
              {
                question.options.length > 2 &&
                <Button
                  bsStyle="danger"
                  onClick={() =>
                    deleteOption(sectionId, (question.frontId || question.id), (option.id || index), !option.id)
                    // The 2nd params question.frontId exists only when creating a new question that hasn't been saved,
                    // if it's falsy -> use the actual .id value.
                    // Third param works in a similar manner, option.id exists for options that have been saved,
                    // when deleting options that haven't been saved -> use the index number.
                    // Fourth param is true IF option.id is falsy -> true when deleting options that haven't been saved.
                }
                >
                  <Icon style={{fontSize: '24px'}} className="icon" name="trash" />
                </Button>
              }
            </div>
          </div>
        )}
        <div>
          <Button bsStyle="default" onClick={() => addOption(sectionId, question.frontId || question.id)}>
            <Icon className="icon" name="plus" /> <FormattedMessage id="addOption" />
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Returns details of existing question
   * @returns {JSX.Element}
   */
  getQuestionDetails = () => {
    const {question, lang} = this.props;
    return (
      <div>
        <h6>{getAttr(question.text, lang)}</h6>
        {
          <div>
            {
              question.options.map(
                (option) => {
                  const answerPercentage = Math.round((option.n_answers / question.n_answers) * 100) || 0;
                  return (
                    <div key={uuid()}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <div style={{color: 'blue', margin: 'auto 10px auto 0'}}>
                          {answerPercentage}%
                        </div>
                        <div>
                          {getAttr(option.text, lang)}
                        </div>
                      </div>
                      <ProgressBar now={answerPercentage} />
                    </div>
                  );
                }
              )
            }
            <Button bsStyle="danger" onClick={this.handleDeleteExistingQuestion}>
              <FormattedMessage id="deleteQuestion" />
            </Button>
          </div>
        }
      </div>
    );
  }

  render() {
    const {question: {frontId, id, n_answers: nAnswers}, isPublic, isEditableQuestion} = this.props;
    const editableQuestion = frontId || (id && !isPublic && nAnswers === 0) || isEditableQuestion;
    /**
     * Display editable form when:
     * - the question is new
     * - the hearing is a draft
     * - hearing has been published but is waiting for publishing date.
     * - hearing is public but doesn't have any comments
     * - hearing was previously public but was unpublished and doesn't have any comments.
     *
     * In all other cases display details of existing questions.
     */
    return editableQuestion
      ? this.getEditableForm() : this.getQuestionDetails();
  }
}

QuestionForm.propTypes = {
  addOption: PropTypes.func,
  deleteOption: PropTypes.func,
  isEditableQuestion: PropTypes.bool,
  isPublic: PropTypes.bool,
  lang: PropTypes.string,
  onDeleteExistingQuestion: PropTypes.func,
  onQuestionChange: PropTypes.func,
  question: PropTypes.object,
  sectionId: PropTypes.string,
  sectionLanguages: PropTypes.array,
};

export default QuestionForm;
