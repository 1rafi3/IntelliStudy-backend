
export const recommendationUtils = {
  /**
   * Converts a Mongoose Recommendation document to a clean API response object.
   * Handles populated relatedRoadmap references gracefully.
   */
  serialize: (doc: any): any => {
    if (!doc) return null;

    let relatedRoadmap = undefined;
    if (doc.relatedRoadmap) {
      if (doc.relatedRoadmap._id) {
        // Populated roadmap details
        relatedRoadmap = {
          id: doc.relatedRoadmap._id.toString(),
          title: doc.relatedRoadmap.title,
          subject: doc.relatedRoadmap.subject,
          progress: doc.relatedRoadmap.progress,
          status: doc.relatedRoadmap.status,
        };
      } else {
        // Raw ObjectId reference string
        relatedRoadmap = doc.relatedRoadmap.toString();
      }
    }

    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      reason: doc.reason,
      category: doc.category,
      priority: doc.priority,
      relatedRoadmap,
      read: doc.read,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
    };
  },
};
export default recommendationUtils;
