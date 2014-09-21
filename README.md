simple-diffable-types
=====================
define simple types such as "scheme descriptions" for ArangoDB, MySQL and such,
which can be diffed so that migration files can be derived easily.

Strictly separating data & code

Yes - somehow I would have preferred using a statically typed language, but I
didn't know which one to use ..

So yes, its "poor man's choice" but will get the job done

    mysql1 =
      tables:
        tbl1:
          primaryKey: "foo"
          indexes: [
            unique: true
            fields: ["field1", "field2"]
          ]
          fields:
            field1:
              auto_increment: true
            field2:
              nullable: false

    mysql2 =
      tables:
        tbl1:
          primaryKey: "foo"
          indexes: [
            unique: true
            fields: ["field1", "field2"]
          ]
          fields:
            field1:
              auto_increment: true


