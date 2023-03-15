import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, FormattedMessage} from 'react-intl';

import { AuthMethodShape } from '../../types';
import { HelpBlock } from 'react-bootstrap';

function HearingAuthMethods({authMethodOptions, hearingAuthMethods, onChange}) {
  return (
    <fieldset className="hearing-auth-methods">
      <legend aria-describedby="auth-method-help-block">
        <FormattedMessage id="hearingAuthMethodRestrictionsLabel"/>
      </legend>

      <div className="hearing-languages__row">
        {authMethodOptions.map((option) => {
          const checked = hearingAuthMethods.some(authMethod => authMethod.id === option.id);
          const onChangeValues = checked ?
            hearingAuthMethods.filter(authMethod => authMethod.id !== option.id) :
            [...hearingAuthMethods, option];
          return (
            <span className="hearing-languages__language" key={option.id}>
              <label htmlFor={`kkEditorAuthMethodSelector-${option.id}`}>
                {option.name}
                <input
                  id={`kkEditorAuthMethodSelector-${option.id}`}
                  type="checkbox"
                  name="authMethod"
                  value={option.id}
                  onChange={() => onChange(onChangeValues)}
                  checked={checked}
                />
              </label>
            </span>
          );
        }
        )}
      </div>
      <HelpBlock id="auth-method-help-block">
        <FormattedMessage id="hearingAuthMethodRestrictionsHelp"/>
      </HelpBlock>
    </fieldset>
  );
}

HearingAuthMethods.propTypes = {
  authMethodOptions: PropTypes.arrayOf(AuthMethodShape).isRequired,
  hearingAuthMethods: PropTypes.arrayOf(AuthMethodShape).isRequired,
  onChange: PropTypes.func.isRequired
};

export {HearingAuthMethods as UnconnectedHearingAuthMethods};
export default injectIntl(HearingAuthMethods);
