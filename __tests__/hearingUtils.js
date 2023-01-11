import {
  acceptsComments,
  canEdit,
  getMainSection,
  getOrCreateSectionByID,
  getSectionByID,
  initNewHearing,
  isEditableQuestion,
  isPublic,
} from '../src/utils/hearing';
import {initNewSection} from '../src/utils/section';
import moment from 'moment';

test('New hearing initializer accepts initial values', () => {
  const hearing = initNewHearing({slug: "test-slug"});
  const mainSection = getMainSection(hearing);
  expect(hearing.slug).toBe("test-slug");
  expect(mainSection.id).toBeDefined();
});


test('Open hearing accepts comments', () => {
  const now = new Date();
  const tomorrow = now.setDate(now.getDate() + 1);
  const hearing = initNewHearing({
    close_at: tomorrow,
  });
  expect(acceptsComments(hearing)).toBe(true);
});


test('Closed hearing does not accept comments', () => {
  const now = new Date();
  const yesterday = now.setDate(now.getDate() - 1);
  const hearing = initNewHearing({
    close_at: yesterday,
  });
  expect(acceptsComments(hearing)).toBe(false);
});


test('Hearing utils getOrCreateSectionByID', () => {
  const hearing = initNewHearing();
  let section = getSectionByID(hearing, "some-id");
  expect(section).not.toBeDefined();

  section = getOrCreateSectionByID(hearing, "some-id");
  expect(section.id).toBe("some-id");
});


test('Organization admin is allowed to edit hearing', () => {
  const hearing = initNewHearing({organization: "test-org"});
  const user = {adminOrganizations: ["test-org"]};
  expect(canEdit(user, hearing)).toBe(true);
});


test('Anonymous user is not allowed to edit hearing', () => {
  const hearing = initNewHearing({organization: "test-org"});
  const user = null;
  expect(canEdit(user, hearing)).toBe(false);
});

describe('isPublic', () => {
  test('returns true if hearing is visible to the public', () => {
    // hearing opened yesterday
    const hearing = initNewHearing({open_at: moment().subtract(1, 'days'), published: true});
    expect(isPublic(hearing)).toBe(true);
  });

  test('returns false if hearing is not visible to the public', () => {
    // hearing will open tomorrow
    const hearing = initNewHearing({open_at: moment().add(1, 'days'), published: true});
    expect(isPublic(hearing)).toBe(false);
  });
});

describe('isEditableQuestion', () => {
  const sectionOne = initNewSection({questions: [{n_answers: 0}]});
  const sectionTwo = initNewSection({questions: [{n_answers: 0}, {n_answers: 0}]});
  const sectionOneAnswered = initNewSection({questions: [{n_answers: 1}]});
  const sectionTwoAnswered = initNewSection({questions: [{n_answers: 0}, {n_answers: 2}]});


  const today = (exp = 'add', days = 0) => {
    if (exp === 'add') { return moment().add(days, 'days'); }
    return moment().subtract(days, 'days');
  };

  test('returns true when hearing is a draft that is waiting for publishing date', () => {
    const hearing = initNewHearing({
      open_at: today('add', 1),
      close_at: today('add', 2),
      published: true,
      closed: true,
      sections: [sectionOne, sectionTwo],
      id: 'id'
    }
    );
    expect(isEditableQuestion(hearing)).toBe(true);
  });

  test('returns true when hearing is a draft that has not been approved for publishing', () => {
    const hearing = initNewHearing({
      open_at: today('add', 1),
      close_at: today('add', 2),
      published: false,
      closed: true,
      sections: [sectionOne, sectionTwo],
      id: 'id'
    }
    );
    expect(isEditableQuestion(hearing)).toBe(true);
  });

  test('returns true when hearing has been published and is open but has no comments', () => {
    const hearing = initNewHearing({
      open_at: today('sub', 1),
      close_at: today('add', 2),
      published: true,
      closed: false,
      sections: [sectionOne, sectionTwo],
      id: 'id'
    }
    );
    expect(isEditableQuestion(hearing)).toBe(true);
  });

  test('returns false when hearing has been published and is open but has comments', () => {
    const hearing = initNewHearing({
      open_at: today('sub', 1),
      close_at: today('add', 2),
      published: true,
      closed: false,
      sections: [sectionOne, sectionTwoAnswered],
      n_comments: 2,
      id: 'id'
    }
    );
    expect(isEditableQuestion(hearing)).toBe(false);
  });

  test('returns true when hearing was open and published but was unpublished with no comments', () => {
    const hearing = initNewHearing({
      open_at: today('sub', 1),
      close_at: today('add', 2),
      published: false,
      closed: false,
      sections: [sectionOne, sectionTwo],
      id: 'id'
    }
    );
    expect(isEditableQuestion(hearing)).toBe(true);
  });

  test('returns false when hearing was open and published but was unpublished with added comments', () => {
    const hearing = initNewHearing({
      open_at: today('sub', 1),
      close_at: today('add', 2),
      published: false,
      closed: false,
      sections: [sectionOneAnswered, sectionTwo],
      n_comments: 1,
      id: 'id'
    }
    );
    expect(isEditableQuestion(hearing)).toBe(false);
  });
});
