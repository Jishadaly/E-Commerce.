// const {categories : category} =require('../model/dataBaseModel')
const category = require('../model/categoryModal')


async function loadCategory (req,res){

            try {
              if (req.session.admin) {
                const categories = await category.find();
              res.render('category',{categories})
              } else {
                res.redirect('/admin/dashboard')
              }
              
          
            } catch (error) {
            console.log(error.message)
            }
          }


         
async function loadAddCategory (req,res){
        try {
          if (req.session.admin) {
            res.render('addCategory',{message:""})
          } else {
            res.render('category')
          }
        
        } catch (error) {
        console.log(Error.message);
        }
}




async function addCategory(req,res) {
          try {
            
          const { categoryName, description } = req.body;
          
          const catName = await  category.findOne({category:categoryName});
          console.log(categoryName);
          console.log("database name : "+ catName.category);
          if (categoryName === catName.category ) {
             res.render('addCategory',{ message:"You are ntered category is already exist" })
          } else {

            const Categories = category({
              category : categoryName ,
              image :  req.file.filename,
              description : description,
              listed:true
              });
              console.log(Categories.image);
              await Categories.save();
              res.redirect('/admin/category');
          }

         

          } catch (error) {
          console.log(error.message);
          }
   }



async function listingCategory (req,res){
          try{
          const id = req.query.id;
          if (id) {
          const data = await category.findById(id);
          data.listed = !data.listed;
          await data.save();
          res.redirect('/admin/category');
          } else {
          res.redirect('/admin/category');
          console.log("not changed ");
          }


          }catch(error){
          console.log(error.message);
          }

}


async function loadEditCategory (req,res){

   try {  if (req.session.admin) {
    const id = req.query.id;
    console.log(id);
    const value = await category.findById(id);
    res.render('editCategory',{value});
    
    console.log(value);
   } else {
    res.render('category')
   }
       
   } catch (error) {
    console.log(error.message)
   }
}



// const updateCategory = async (req, res) => {
//   try {
//       const id = req.query.id;
//       const { name, description } = req.body;

//       // Handle image update if a new image is provided
//       if (req.file) {
//           // Assuming the image field in your Category model is named 'image'
//           const imagePath = req.file.filename;
//           // Update the image field along with other fields
//           const updateCategory = await Category.findByIdAndUpdate(
//               { _id: id },
//               { name, description, image: imagePath },
//               { new: true }
//           );
//           if (updateCategory) {
//               console.log('Category Updated:', updateCategory);
//           } else {
//               console.log('Category not found or update failed.');
//           }
//       } else {
//           // If no new image is provided, update other fields without the image
//           const updateCategory = await Category.findByIdAndUpdate(
//               { _id: id },
//               { name, description },
//               { new: true }
//           );
//           if (updateCategory) {
//               console.log('Category Updated:', updateCategory);
//           } else {
//               console.log('Category not found or update failed.');
//           }
//       }

//       res.redirect('/admin/category');
//   } catch (error) {
//       console.log(error.message);
//   }
// };


async function updateCategory (req,res){
  try {
    
    console.log(req.file);
    
    const id=req.params.id;
    const name = req.body.categoryname;
    const desc=req.body.description;
    const image  =  req.file.filename;
    
    
    

    if (image) {
      const updatedCat = await category.findByIdAndUpdate({_id:id},{category:name,description:desc ,image:image},{ new: true });
    } else {
      const updatedCat = await category.findByIdAndUpdate({_id:id},{category:name,description:desc},{ new: true });
    }

      res.redirect('/admin/category')

  } catch (error) {
    console.log(error.message);
  }
}



 

module.exports = {
  loadCategory,
  loadAddCategory,
  addCategory,
  listingCategory,
  loadEditCategory,
  updateCategory,
  
}