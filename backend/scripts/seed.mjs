
import * as dns from 'node:dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is missing from .env');
}

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
});

const siteSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, lowercase: true },
  title: { type: String, required: true },
  html: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  links: { type: [String], default: [] },
});

const visitSchema = new mongoose.Schema({
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  address: { type: String, required: true },
  fromAddress: { type: String, default: null },
  visitedAt: { type: Date, required: true },
});

const Person = mongoose.model('Person', personSchema);
const Site = mongoose.model('Site', siteSchema);
const Visit = mongoose.model('Visit', visitSchema);

const people = [
  'Mahad Khalid',
  'Ayesha Malik',
  'Hamza Ahmed',
  'Sara Noor',
];

const sites = [
  {
    address: 'craftspace.small',
    title: 'Craftspace — A Place for Ideas',
    author: 'Mahad Khalid',
    links: ['designnotes.small', 'projects.small', 'buildlog.small'],
    html: `<h1>Welcome to Craftspace</h1><p>A small corner of the web for people who enjoy making things. Good ideas often begin with a rough sketch, a curious question, or a conversation.</p><p>Here, we collect experiments, creative notes, and projects worth sharing.</p><h2>Explore</h2><ul><li><a href="designnotes.small">Design Notes</a></li><li><a href="projects.small">Projects</a></li><li><a href="buildlog.small">Build Log</a></li></ul>`,
  },
  {
    address: 'designnotes.small',
    title: 'Design Notes',
    author: 'Mahad Khalid',
    links: ['craftspace.small', 'photostories.small'],
    html: `<h1>Design Notes</h1><p>Good design is not only about appearance. It is about making the next step feel obvious and comfortable.</p><p>Spacing, contrast, typography, and clear language can make a simple interface feel thoughtful.</p><p><a href="craftspace.small">Back to Craftspace</a> · <a href="photostories.small">Photo Stories</a></p>`,
  },
  {
    address: 'projects.small',
    title: 'Projects and Experiments',
    author: 'Mahad Khalid',
    links: ['craftspace.small', 'techcorner.small', 'missingproject.small'],
    html: `<h1>Projects and Experiments</h1><p>This page is a collection of small experiments. Some become useful tools, while others teach us what not to build.</p><h2>Current thought</h2><p>Start with a clear problem, build the smallest useful version, and improve it through feedback.</p><p><a href="techcorner.small">Read Tech Corner</a> · <a href="missingproject.small">An unfinished project</a></p>`,
  },
  {
    address: 'photostories.small',
    title: 'Photo Stories',
    author: 'Ayesha Malik',
    links: ['traveljournal.small', 'designnotes.small'],
    html: `<h1>Photo Stories</h1><p>Photographs help us remember the details that ordinary days often hide. A quiet street, a cup of tea, or sunlight on an old wall can become a story.</p><p>Photography is less about having perfect equipment and more about noticing what is already around us.</p><p><a href="traveljournal.small">Travel Journal</a></p>`,
  },
  {
    address: 'traveljournal.small',
    title: 'Travel Journal',
    author: 'Ayesha Malik',
    links: ['photostories.small', 'localarchive.small'],
    html: `<h1>Travel Journal</h1><p>Every journey has its own rhythm. Some places are remembered for their landscapes, others for the people we meet along the way.</p><p>Keeping a journal makes it easier to remember small details long after a trip has ended.</p><p><a href="localarchive.small">Explore the Local Archive</a></p>`,
  },
  {
    address: 'fooddiary.small',
    title: 'Food Diary',
    author: 'Ayesha Malik',
    links: ['greenroom.small', 'traveljournal.small'],
    html: `<h1>Food Diary</h1><p>Food brings people together. A familiar recipe can carry memories of home, while trying a new ingredient can make an ordinary evening interesting.</p><p>Simple meals, seasonal ingredients, and shared tables are worth celebrating.</p><p><a href="greenroom.small">Visit Green Room</a></p>`,
  },
  {
    address: 'greenroom.small',
    title: 'The Green Room',
    author: 'Sara Noor',
    links: ['fooddiary.small', 'localarchive.small'],
    html: `<h1>The Green Room</h1><p>Plants remind us that growth takes patience. A little sunlight, suitable soil, and regular care can make a big difference over time.</p><p>This page shares notes about indoor plants and greener everyday habits.</p><p><a href="fooddiary.small">Food Diary</a> · <a href="localarchive.small">Local Archive</a></p>`,
  },
  {
    address: 'techcorner.small',
    title: 'Tech Corner',
    author: 'Hamza Ahmed',
    links: ['buildlog.small', 'projects.small'],
    html: `<h1>Tech Corner</h1><p>Technology is most interesting when it solves a real problem. Tools and frameworks change, but clear thinking and useful documentation remain important.</p><p>Small, reliable improvements often matter more than adding features for their own sake.</p><p><a href="buildlog.small">Build Log</a></p>`,
  },
  {
    address: 'buildlog.small',
    title: 'Build Log',
    author: 'Hamza Ahmed',
    links: ['techcorner.small', 'craftspace.small'],
    html: `<h1>Build Log</h1><p>A build log records the decisions behind a project: what worked, what failed, and what should happen next.</p><p>Writing down the process makes it easier to learn from mistakes and share progress with others.</p><p><a href="craftspace.small">Return to Craftspace</a></p>`,
  },
  {
    address: 'localarchive.small',
    title: 'Local Archive',
    author: 'Sara Noor',
    links: ['traveljournal.small', 'greenroom.small'],
    html: `<h1>Local Archive</h1><p>Local history is made of everyday details: old buildings, familiar markets, community stories, and places that change over time.</p><p>Collecting these memories helps preserve a sense of place for the future.</p><p><a href="traveljournal.small">Travel Journal</a> · <a href="greenroom.small">The Green Room</a></p>`,
  },
];

const history = [
  ['Mahad Khalid', 'craftspace.small', null, 0],
  ['Mahad Khalid', 'designnotes.small', 'craftspace.small', 4],
  ['Mahad Khalid', 'projects.small', 'designnotes.small', 8],
  ['Mahad Khalid', 'techcorner.small', 'projects.small', 12],
  ['Mahad Khalid', 'buildlog.small', 'techcorner.small', 16],
  ['Mahad Khalid', 'craftspace.small', 'buildlog.small', 20],
  ['Mahad Khalid', 'photostories.small', 'craftspace.small', 25],
  ['Mahad Khalid', 'traveljournal.small', 'photostories.small', 30],
  ['Mahad Khalid', 'localarchive.small', 'traveljournal.small', 35],
  ['Mahad Khalid', 'greenroom.small', 'localarchive.small', 40],
  ['Mahad Khalid', 'fooddiary.small', 'greenroom.small', 45],
  ['Ayesha Malik', 'photostories.small', null, 5],
  ['Ayesha Malik', 'traveljournal.small', 'photostories.small', 12],
  ['Ayesha Malik', 'fooddiary.small', 'traveljournal.small', 19],
  ['Ayesha Malik', 'greenroom.small', 'fooddiary.small', 26],
  ['Ayesha Malik', 'localarchive.small', 'greenroom.small', 33],
  ['Hamza Ahmed', 'techcorner.small', null, 10],
  ['Hamza Ahmed', 'buildlog.small', 'techcorner.small', 18],
  ['Hamza Ahmed', 'projects.small', 'buildlog.small', 27],
  ['Hamza Ahmed', 'craftspace.small', 'projects.small', 36],
  ['Sara Noor', 'greenroom.small', null, 15],
  ['Sara Noor', 'fooddiary.small', 'greenroom.small', 24],
  ['Sara Noor', 'localarchive.small', 'fooddiary.small', 38],
];

async function seed() {
  await mongoose.connect(uri);

  // Remove old demo users and their history.
  const oldPeople = await Person.find({
    name: { $in: ['Ali Khan', 'Mahad khalid'] },
  });

  for (const oldPerson of oldPeople) {
    await Visit.deleteMany({ person: oldPerson._id });
    await Person.deleteOne({ _id: oldPerson._id });
  }

  const personIds = {};

  for (const name of people) {
    const person = await Person.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true },
    );
    personIds[name] = person._id;
  }

  for (const site of sites) {
    await Site.findOneAndUpdate(
      { address: site.address },
      {
        ...site,
        author: personIds[site.author],
      },
      { upsert: true, new: true },
    );
  }

  const start = new Date('2026-11-08T20:00:00+05:00');

  for (const [personName, address, fromAddress, minutes] of history) {
    const visitedAt = new Date(start.getTime() + minutes * 60 * 1000);

    await Visit.findOneAndUpdate(
      {
        person: personIds[personName],
        address,
        visitedAt,
      },
      {
        person: personIds[personName],
        address,
        fromAddress,
        visitedAt,
      },
      { upsert: true, new: true },
    );
  }

  console.log('Seed completed successfully.');
  console.log('People:', people.length);
  console.log('Sites:', sites.length);
  console.log('Visits:', history.length);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
