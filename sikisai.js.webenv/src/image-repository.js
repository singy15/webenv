let repo = {};

class ImageRepository {
  constructor(/*gadpt*/) {
    // this.gadpt = gadpt;
  }

  fetch(id) {
    if (repo[id]) {
      return repo[id];
    }

    // let s = this.gadpt.createSprite({
    //   path: `/resource/${id}`,
    // });
    // repo[id] = s;
    // return s;

    throw new Error(`image "${id}" is not registered in repository.`);
  }

  register(id, sprite) {
    repo[id] = sprite;
  }
}

export default {
  ImageRepository,
};
