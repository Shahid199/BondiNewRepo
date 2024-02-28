const { default: mongoose } = require("mongoose");
const Curriculum = require("../model/Curriculum");
const ObjectId = mongoose.Types.ObjectId;

//create Curriculum

const createCurriculum = async (req, res, next) => {
const {
    name,
    isAdmission,
  } = req.body;

  let data = new Curriculum({    
    name,
    isAdmission: JSON.parse(isAdmission)
    
  });
  let doc;
  try {
    doc = await data.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json(doc);
};


//get curriculums

const getCurriculums = async(req,res,next)=>{
    const curriculums = await Curriculum.find({});
    if(curriculums){
        return res.status(200).json(curriculums);
    }else{
        return res.status(4004).json("No data found");
    }
}


const updateCurriculum = async (req, res, next) => {
  const {
    id,
    name,
    isAdmission
  } = req.body;
 
  //console.log("CT", moment(new Date()));
  //console.log("ST", moment(new Date(startTime)));
  //console.log("ET", moment(new Date(endTime)));

  let updatedCurriculum = {
    name,    
    isAdmission: JSON.parse(isAdmission),
  };
  let updStatus = null;
  try {
    updStatus = await Curriculum.updateOne({ _id: id }, updatedCurriculum);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json("Problem at update.");
  else return res.status(201).json("Updated.");
};

const removeCurriculum = async (req, res, next) => {
  const id = req.body.id;
  if (!ObjectId.isValid(id))
    return res.status(404).json("Invalid exam Id.");
  const curObj = new mongoose.Types.ObjectId(id);
  let queryResult = null;
  try {
    queryResult = await Curriculum.find({ _id:curObj }).remove().exec();
  } catch (err) {
    return res.status(500).json(err);
  }
  if (queryResult) return res.status(201).json("Curriculum Removed.");
  else return res.status(404).json("Something went wrong.");
};
//export functions
exports.createCurriculum = createCurriculum;
exports.getCurriculums = getCurriculums;
exports.updateCurriculum= updateCurriculum;
exports.removeCurriculum = removeCurriculum;