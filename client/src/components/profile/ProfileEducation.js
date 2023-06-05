import React from 'react';
import PropTypes from 'prop-types';
import formatDate from '../../utils/formatDate';

const ProfileEducation = ({
  education: { school, degree, fieldofstudy, current, to, from, description },
}) => {
  return (
    <div>
      <h3 className="text-dark">{school}</h3>
      <p>
        {formatDate(from)} - {to ? formatDate(to) : 'Now'}
      </p>
      <p>
        <strong>Degree: {degree}</strong>
      </p>
      <p>
        <strong>Field of Study: {fieldofstudy}</strong>
      </p>
      <p></p>
      <p>
        <strong>Description: {description}</strong>
      </p>
    </div>
  );
};

ProfileEducation.propTypes = {
  education: PropTypes.object.isRequired,
};

export default ProfileEducation;
