import { BookmarkResponse } from './bookmark.types';

export const bookmarkUtils = {
  serialize: (doc: any): BookmarkResponse => {
    return {
      id: doc._id ? doc._id.toString() : doc.id,
      user: doc.user ? doc.user.toString() : '',
      type: doc.type,
      referencedId: doc.referencedId,
      title: doc.title,
      description: doc.description || '',
      preview: doc.preview || '',
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
    };
  },
};
